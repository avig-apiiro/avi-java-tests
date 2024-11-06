import fs from 'fs';
import path from "path";
import yargs from 'yargs';

import {LimLogger} from "./internals/Logger";
import {ensureWorkingDirectories} from "./internals/setup";
import {Context} from "./types/Context";

import {processDirectory} from "./workers/FolderWorker";

const logger = new LimLogger("DEV", __filename);

const argv = yargs
    .option('dir', {
        alias: 'd',
        description: 'A folder that contains one or more Node repositories to extract',
        type: 'string',
        nargs: 1,
    })
    .option('compress', {
        alias: 'c',
        description: 'Indicates that result should be compressed',
        type: 'boolean',
        nargs: 0,
    })
    .argv;

if (!argv.dir) {
    logger.error("Must provide directory");
    process.exit(1);
}

if (!fs.existsSync(argv.dir) || !(fs.lstatSync(argv.dir).isDirectory)) {
    logger.error(`Invalid directory path: ${argv.dir}`);
    process.exit(1);
}

const correlationId = path.basename(argv.dir, path.extname(argv.dir));
const devContext = Context.setupContext(correlationId, undefined, argv.dir);

(async function () {
    try {
        const logger = new LimLogger(correlationId, __filename);
        ensureWorkingDirectories();
        logger.info(`Going to parse ${argv.dir}`);
        await Promise.resolve(processDirectory(devContext));
    } catch (error) {
        logger.error(`Failure to execute dev parse request. \n${error.stack}`);
    }
}());

