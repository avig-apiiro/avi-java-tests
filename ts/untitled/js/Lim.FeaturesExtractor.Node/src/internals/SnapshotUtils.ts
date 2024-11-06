import path from "path";
import {config} from '../config';
import {MissingCommitError} from "../types/Errors";
import {tmpWorkingDirectory} from "./consts";
import {execAsync} from "./FilesAsyncUtil";
import {LimLogger} from "./Logger";
import {hrtimeToString} from "./TimeUtils";
import uuid from "uuid-random";


export async function SnapshotCommit(correlationId: string, commitSha: string, repositoryKey: string): Promise<string> {

    const start = process.hrtime();
    const logger = new LimLogger(correlationId, __filename);
    const tmpDirPath = path.join(tmpWorkingDirectory, `${commitSha}_${uuid()}`);

    logger.info(`Starting to snapshot ${commitSha}@${repositoryKey} to ${tmpDirPath}`);

    const repositoryClonePath = path.join(config.directories.sharedDirectoryRootPath, config.directories.gitDirectoryName, repositoryKey);

    const command = `git-snap -s "${repositoryClonePath}" -r "${commitSha}" -o "${tmpDirPath}" -i *.json,*.js,*.ts --ignore-case`;
    const {error, stdout, stderr} = await execAsync(command);

    if (!error) {
        logger.debug(`completed '${command}' succesfully with stdout:\n${stdout}\n${stderr}`)
    } else {
        const {code, signal} = error
        if (code && code >= 200) {
            logger.info(`Failed to take snapshot of commit ${commitSha} in ${repositoryKey}`);
            throw new MissingCommitError(`missing commit ${commitSha} in ${repositoryKey}`);
        }
        let errorMessage = `Running '${command}' failed with code ${code}`
        if (signal) {
            errorMessage += `, signal: ${signal}`
        }
        if (stdout) {
            errorMessage += `\nstdout:\n${stdout}`
        }
        if (stderr) {
            errorMessage += `\nstdout:\n${stderr}`
        }
        throw new Error(errorMessage)
    }

    logger.debug(`Snapshot created from ${commitSha}@${repositoryKey} to ${tmpDirPath} in ${hrtimeToString(process.hrtime(start))}`);

    return tmpDirPath;
}
