import {isEmpty} from "lodash";
import path from "path";
import {getCompilerOptionsFromTsConfig} from "ts-morph";
import ts from "typescript";
import {existsAsync} from "../internals/FilesAsyncUtil";
import {scrapeFilesAsync} from "../internals/FilesScraper";
import {LimLogger} from "../internals/Logger";
import {executeWithLogAsync} from "../internals/LoggingUtils";
import {executeParser} from "../parser/Parser";
import {exportParserState} from "../parser/state/ExportState";
import {Context} from "../types/Context";

export async function processDirectory(context: Context): Promise<Map<string, string>> {
    const logger = new LimLogger(context.correlationId, __filename);

    if (isEmpty(context.outputDirectoryPath)) {
        context.outputDirectoryPath = path.dirname(context.directoryPath);
    }
    logger.info(`Starting processing of ${context.directoryPath} into ${context.outputDirectoryPath}`);

    return await executeWithLogAsync(logger, "directory worker", () =>
        processDirectoryWorker(context, logger));
}

async function processDirectoryWorker(context: Context, logger: LimLogger): Promise<Map<string, string>> {
    const fileNames: string[] = await scrapeFilesAsync(context);
    const compilerOptions = await getCompilerOptions(context.directoryPath, logger);
    await executeParser(context, fileNames, compilerOptions);

    return await executeWithLogAsync(logger, "parser state export", () =>
        exportParserState(context));
}

export async function getCompilerOptions(directoryPath: string, logger: LimLogger): Promise<ts.CompilerOptions> {
    const projectOptions: ts.CompilerOptions = (await getSpecificDirectoryCompilerOptions(directoryPath, logger)) ?? {
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        noImplicitAny: false,
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.CommonJS
    };

    projectOptions.allowJs = true;  // voodoo people magic people
    projectOptions.typeRoots = [`${process.cwd()}/node_modules/@types`];
    return projectOptions;
}

async function getSpecificDirectoryCompilerOptions(directoryPath: string, logger: LimLogger): Promise<ts.CompilerOptions | undefined> {
    let tsConfigPath = path.join(directoryPath, 'tsconfig.json');

    try {
        return await existsAsync(tsConfigPath) ? getCompilerOptionsFromTsConfig(tsConfigPath).options : undefined;
    } catch (error) {
        logger.info(`Failed to get compiler options from ts config for directory=${directoryPath}: ${error}. Fallback to default.`);
        return undefined;
    }
}
