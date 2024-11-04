import {MessagePort, parentPort} from "worker_threads";
import {LimLogger} from "./internals/Logger";
import {executeWithLogAsync} from "./internals/LoggingUtils";
import {ParseArgs} from "./models/parseArgs";
import {Context} from "./types/Context";
import {MissingCommitError, ParseCancelled} from "./types/Errors";
import {processDirectory} from "./workers/FolderWorker";
import {snapshotAndProcessDirectory} from "./workers/SnapshotterFolderWorker";
import {WorkerMessages} from "./workers/WorkerMessages";

function getContextFromParseArgs(
    {
        outputDirectoryPath,
        correlationId
    }: ParseArgs,
    isCancelled: () => boolean
): Context {
    const appContext = Context.setupContext(correlationId, isCancelled);
    appContext.outputDirectoryPath = outputDirectoryPath;

    return appContext;
}

async function handleParseRequestAsync(parseArgs: ParseArgs, appContext: Context) {
    const typeToPath = parseArgs.repositoryKey && parseArgs.commitSha
        ? await snapshotAndProcessDirectory(appContext, parseArgs.repositoryKey, parseArgs.commitSha)
        : await processDirectory(appContext);
    const result: Record<string, string> = {};
    typeToPath.forEach((path, type) => result[type] = path);

    return result;
}

export async function workAsync(parseArgs: ParseArgs, isCancelled: () => boolean): Promise<Record<string, string> | null> {
    const {correlationId} = parseArgs;

    const logger = new LimLogger(correlationId, __filename);
    const appContext = getContextFromParseArgs(parseArgs, isCancelled);

    try {
        return await executeWithLogAsync(logger, `parser app request ${correlationId}`,
            async () => await handleParseRequestAsync(parseArgs, appContext)
        );
    } catch (error) {
        if (error instanceof ParseCancelled) {
            logger.info(`Failed to execute parse request due to cancellation`);
        } else if (error instanceof MissingCommitError) {
            logger.info(`missing commit, will re-fetch commit ${correlationId}`)
            throw error;
        } else {
            logger.error(`Failed to execute parse request.\n${error.stack}`);
        }
    }
    return null;
}

parentPort?.on("message", async ({port, args}: { port: MessagePort, args: ParseArgs }) => {
    try {
        let isCancelled = false;
        port.on("message", (message: WorkerMessages) => {
            if (message === WorkerMessages.Cancellation) {
                isCancelled = true;
            }
        });
        const result = await workAsync(args, () => isCancelled);
        parentPort?.postMessage({result});
    } catch (error) {
        parentPort?.postMessage({error});
    }
});
