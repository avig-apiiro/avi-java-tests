import {rmdirAsync} from "../internals/FilesAsyncUtil";
import {LimLogger} from "../internals/Logger";
import {executeWithLogAsync} from "../internals/LoggingUtils";
import {SnapshotCommit} from "../internals/SnapshotUtils";
import {Context} from "../types/Context";
import {processDirectory} from "./FolderWorker";

export async function snapshotAndProcessDirectory(parserContext: Context, repositoryKey: string, commitSha: string): Promise<Map<string, string>> {
    const logger = new LimLogger(parserContext.correlationId, __filename);

    let snapshotPath;
    try {
        snapshotPath = await SnapshotCommit(parserContext.correlationId, commitSha, repositoryKey);
        parserContext.directoryPath = snapshotPath;
        return await processDirectory(parserContext);
    } finally {
        if (snapshotPath) {
            await executeWithLogAsync(
                logger, `directory delete (${snapshotPath})`, () =>
                    rmdirAsync(snapshotPath, {recursive: true})
            );
        }
    }
}
