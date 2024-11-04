import globby from 'globby';
import {isBinaryFile} from "isbinaryfile";
import {isEmpty} from 'lodash';
import path from 'path';
import {getCompilerOptionsFromTsConfig} from "ts-morph";
import {config} from "../config";
import {Context} from "../types/Context";
import {existsAsync, statFileAsync} from "./FilesAsyncUtil";
import {LimLogger} from "./Logger";
import {getMemoryConsumptionString} from "./MemoryUtils";
import {testSuffixes} from "../features/providers/labelsProviders/TestLabelsProviders";

const _baseDirectoriesToSkip = [
    // This list is inspired by https://github.com/github/gitignore/blob/master/Node.gitignore (and by looking at
    // "spamming" directories of several hundred repositories.

    '.git*',

    // Package managers \ dependency directories \ cache
    '.npm',
    '.yarn',
    '.cache',

    '*node_module*',
    'web_modules',
    'jspm_packages',
    'bower_components',

    // Builds
    'dist',
    'build/Release',
    '.vuepress/dist',

    // Potential paths for assets such as jquery and bootstrap
    'public',
    'static',
    'assets',
    'libs',

    // Tests
    "__tests__",
    "tests"
];

const unsupportedExtensions = ['.min.js', 'require.js', ...testSuffixes];
const supportedExtensions = ['.ts', '.js'];

export async function scrapeFilesAsync(parserContext: Context, targetExtensions: string[] = supportedExtensions): Promise<string[]> {
    const logger = new LimLogger(parserContext.correlationId, __filename);
    const directoryPath = parserContext.directoryPath;

    let directoriesToSkip = await getDirectoriesToSkipAsync(directoryPath);

    const matchPatterns = targetExtensions.map(ext => `**/*${ext}`);
    const ignorePatterns = [
        ...directoriesToSkip.map(dir => `**/${dir}/**`),
        ...unsupportedExtensions.map(ext => `**/*${ext}`)
    ];

    const filesCollection: string[] = [];
    const projectDirs = await findProjectDirs(directoryPath, directoriesToSkip, logger);

    for (const projectDir of projectDirs) {
        for await (const filename of globby.stream(matchPatterns, {
            ignore: ignorePatterns,
            cwd: path.join(directoryPath, projectDir)
        })) {
            parserContext.throwIfCancelled();

            let absoluteFilename = path.join(directoryPath, projectDir, filename as string);
            if (await isBinaryFile(absoluteFilename) || (await statFileAsync(absoluteFilename)).isSymbolicLink()) {
                continue;
            }
            filesCollection.push(absoluteFilename);
        }
    }

    const extensions = targetExtensions.join(", ");
    logger.info(`Collected ${filesCollection.length} files from ${path.parse(directoryPath).base} with extensions ${extensions}`);
    logger.info(getMemoryConsumptionString());
    return filesCollection;
}

async function getDirectoriesToSkipAsync(directoryPath: string): Promise<string[]> {
    const directoriesToSkip = [..._baseDirectoriesToSkip, ...config.app.additionalDirectoriesToSkip];

    // TODO ignore out dir from tsconfig.json per each project dir instead of only at snapshot root
    const tsconfigPath = `${directoryPath}/tsconfig.json`;
    if (await existsAsync(tsconfigPath)) {
        try {
            const compilerOptions = getCompilerOptionsFromTsConfig(tsconfigPath);
            const typescriptOutDir = compilerOptions.options?.outDir;
            if (typescriptOutDir !== undefined) {
                const resolvedOutDir = path.relative(directoryPath, path.resolve(directoryPath, typescriptOutDir));
                directoriesToSkip.push(resolvedOutDir);
            }
        } catch {
        }
    }

    return directoriesToSkip;
}

async function findProjectDirs(directoryPath: string, directoriesToSkip: string[], logger: LimLogger): Promise<string[]> {
    const ignorePatterns = directoriesToSkip.map(dir => `**/${dir}/**`);
    const packageFiles = await globby("**/package.json", {cwd: directoryPath, ignore: ignorePatterns});
    if (!isEmpty(packageFiles)) {
        const packageDirs = packageFiles.map(path.dirname).sort();
        const projectDirs: string[] = [];
        for (const packageDir of packageDirs) {
            if (projectDirs.some(existingProjectDir => packageDir.startsWith(existingProjectDir + '/'))) {
                continue;
            }
            if ((await statFileAsync(path.join(directoryPath, packageDir))).isSymbolicLink()) {
                continue;
            }
            projectDirs.push(packageDir);
        }

        logger.info(`Project directories detected: [${projectDirs.join(", ")}]`);
        return packageDirs;
    }

    logger.info('No project directories detected; using snapshot root.');
    return ['.'];
}
