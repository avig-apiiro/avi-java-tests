import fs from 'fs';
import express, {Request, Response} from 'express';
import {Server} from "http";
import morgan from "morgan";
import {MessageChannel, MessagePort} from "worker_threads";
import {isTimeoutError, StaticPool} from "node-worker-threads-pool";
import os from 'os';
import {config} from "./config";
import {LimLogger} from "./internals/Logger";
import {getProcessMemoryConsumptionToString} from "./internals/MemoryUtils";
import {ensureWorkingDirectories} from "./internals/setup";
import {ParseArgs} from './models/parseArgs';
import {CommitExtractionDoneMessage, ExtractCommitMessage, HandleQueueMessageRequestBody, ReFetchCommitMessage} from "./queue/queueMessageTypes";
import QueueNames from './queue/queueNames';
import {publishAsync} from './queue/messageQueuePublisher';
import {MissingCommitError} from './types/Errors';
import uuid from "uuid-random";
import {WorkerMessages} from "./workers/WorkerMessages";
import path from "path";

const appPort = config.app.port;
const timeoutSeconds = config.app.timeoutMinutes * 60;

const workersCount = Number(process.env.WORKERS ?? config.app.workers ?? os.cpus().length);
const workersPool = new StaticPool<{ port: MessagePort, args: ParseArgs }, { error: Error, result: Record<string, string> }>({
    size: workersCount,
    task: config.app.workerFilePath
});

const logger = new LimLogger("APP", __filename);

morgan.token('exec-id', (req: Request, res: Response) => `Req=${req.url}`);

const app = express();
app.use(express.json());
app.use(morgan(
    ':exec-id ":method :url" :status :res[content-length] :response-time ms',
    {
        stream:
            {
                write: (message: string) => logger.debug(message)
            }
    })
);

app.get('/memory', async (req, res) => {
    const memoryConsumption = getProcessMemoryConsumptionToString();
    logger.info(memoryConsumption);
    res.end(memoryConsumption);
});

app.get('/api/handle-message/is-alive', (_, res) => res.sendStatus(200));

app.post('/api/handle-message', async (req: Request<{}, Record<string, string>, HandleQueueMessageRequestBody>, res: Response) => {
    let result: Record<string, string> = {};
    try {
        const queueMessage = req.body.QueueMessage;

        const extractCommitMessage = JSON.parse(queueMessage.Data || '{}') as ExtractCommitMessage;
        const correlationId = `${extractCommitMessage.CommitSha}_${queueMessage.CorrelationId ?? uuid()}`;
        const parseArgs: ParseArgs = {
            commitSha: extractCommitMessage.CommitSha,
            repositoryKey: extractCommitMessage.RepositoryKey,
            outputDirectoryPath: path.join(config.directories.sharedDirectoryRootPath, extractCommitMessage.OutputDirectoryPath),
            correlationId: correlationId
        };

        const {port1: portToWorker, port2: portToParent} = new MessageChannel();

        let isCancelled = false;
        const onCancelled = (reason) => {
            isCancelled = true;
            portToWorker.postMessage(WorkerMessages.Cancellation);
            logger.info(`Request cancelled due to ${reason}`);
        };
        req.on("close", () => onCancelled("connection closed"));
        req.on("error", () => onCancelled("connection error"));

        const workerResult = await workersPool.createExecutor()
            .setTransferList([portToParent])
            .setTimeout(req.body.TimeoutInSeconds * 1000)
            .exec({port: portToParent, args: parseArgs});

        result = workerResult.result;
        const error = workerResult.error;

        if (error instanceof MissingCommitError) {
            const refetchPublished = await publishReFetchCommitMessage(
                extractCommitMessage.CommitSha,
                extractCommitMessage.RepositoryKey,
                queueMessage.Priority
            );
            if (result) {
                deleteFilePaths(Object.values(result));
            }
            return returnQueueHandlingStatus(res, refetchPublished);
        }
        if (!result || isCancelled) {
            returnQueueHandlingStatus(res, false);
            return;
        }

        const relativizedResult: Record<string, string> = {};
        for (const key of Object.keys(result)) {
            relativizedResult[key] = path.relative(config.directories.sharedDirectoryRootPath, result[key]);
        }

        const extractionDoneMessage: CommitExtractionDoneMessage = {
            CodeEntityToExtractedFeaturesPath: relativizedResult,
            CodeParsingTarget: 'Node',
            CommitSha: extractCommitMessage.CommitSha,
            RepositoryKey: extractCommitMessage.RepositoryKey,
            CustomSensitiveDataDefinitions: extractCommitMessage.CustomSensitiveDataDefinitions
        }

        const published = await publishAsync({
            QueueName: QueueNames.extractionDone,
            Data: JSON.stringify(extractionDoneMessage),
            Priority: queueMessage.Priority
        });

        if (!published) {
            deleteFilePaths(Object.values(result))
        }
        returnQueueHandlingStatus(res, published);
    } catch (error) {
        if (isTimeoutError(error)) {
            logger.info("Failed on timed out")
        } else {
            logger.error(`Failed to handle message, ${error}\n${!error ? '' : error.stack}`);
        }
        if (result) {
            deleteFilePaths(Object.values(result))
        }
        returnQueueHandlingStatus(res, false);
    } finally {
        req.removeAllListeners("close")
        req.removeAllListeners("error")
    }
});

async function publishReFetchCommitMessage(commitSha: string, repositoryKey: string, priority?: number): Promise<boolean> {
    const fetchCommitMessage: ReFetchCommitMessage = {
        CommitSha: commitSha,
        RepositoryKey: repositoryKey
    };

    return await publishAsync({
        QueueName: QueueNames.fetchCommit,
        Data: JSON.stringify(fetchCommitMessage),
        Priority: priority
    });
}

function deleteFilePaths(paths: string[]) {
    if (!paths) {
        return;
    }

    paths.filter(path => !!path).forEach(path => {
        fs.unlink(path, () => {
        });
    });
}

function returnQueueHandlingStatus(res: Response, success: boolean) {
    res.status(200).send({Status: success});
}

const startMessage = () => {
    const nodeOptions = process.env.NODE_OPTIONS;
    const expressMessage = `Express server listening on port ${appPort}`;
    const pidMessage = `pid=${process.pid}`;
    const workersMessage = `workers=${workersCount}`;
    const nodeOptionsMessage = nodeOptions ? `NODE_OPTIONS=${nodeOptions}` : "";
    return [expressMessage, pidMessage, workersMessage, nodeOptionsMessage].join(". ");
};

ensureWorkingDirectories();

let server: Server;
server = app.listen(appPort, () => logger.info(startMessage()));
server.setTimeout(1000 * timeoutSeconds);
