import fs from "fs";
import {pipeline, Readable} from "stream";
import {promisify} from "util";
import {createGzip} from "zlib";
import {FeatureValue} from "../features/providers/ProviderBase";
import {Context} from "../types/Context";
import {writeFileAsync} from "./FilesAsyncUtil";
import {LimLogger} from "./Logger";
import {hrtimeToString} from "./TimeUtils";
import uuid from "uuid-random";

export class FilesWriter {
    readonly resultPath: string;

    constructor(resultPath: string) {
        this.resultPath = resultPath;
    }

    featuresFilename(prefix: string, compress: boolean): string {
        return `${prefix.toLowerCase()}__node_${uuid()}.json${compress ? ".gz" : ""}`;
    }

    writeFeatures(parserContext: Context, header: string[], featuresRows: FeatureValue[][], filenamePrefix: string): Promise<string> {
        const content = {
            header: header,
            rows: featuresRows
        }
        return this.writeContent(parserContext, content, featuresRows.length, filenamePrefix);
    }

    writeElements<T>(parserContext: Context, elements: T[], filenamePrefix: string) {
        return this.writeContent(parserContext, elements, elements.length, filenamePrefix);
    }

    private async writeContent(parserContext: Context, content: any, contentSize: number, filenamePrefix: string): Promise<string> {
        parserContext.throwIfCancelled();

        const start = process.hrtime();
        const logger = new LimLogger(parserContext.correlationId, __filename);

        logger.info(`Starting to write features`);

        const filename = `${this.resultPath}/${this.featuresFilename(filenamePrefix, parserContext.compressOutput)}`;
        logger.info(`Going to write ${contentSize} rows to ${filename}`);

        const data = JSON.stringify(content);
        if (!data) {
            logger.error(`Impossible! but we got empty 'data' when writing features file to ${filename}`);
        }


        if (parserContext.compressOutput) {
            const gzip = createGzip();
            const writer = fs.createWriteStream(filename);
            await promisify(pipeline)(Readable.from(data), gzip, writer);
        } else {
            await writeFileAsync(filename, data);
        }

        logger.info(`Done writing ${contentSize} rows to ${filename} in ${hrtimeToString(process.hrtime(start))}`);
        return filename;
    }
}
