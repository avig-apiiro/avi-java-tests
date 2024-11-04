import moment from 'moment';
import path from "path";
import {createLogger, format, Logger, transports} from "winston";

import {config, isDevEnv} from "../config";

const loggerBasePath = "Lim.FeaturesExtractor.Node";

const globalLogger = createGlobalLogger();

function createGlobalLogger(): Logger {
    const logger = createLogger({
        format: format.printf(info => (
            `${moment(info.timestamp).utc().format("YYYY-MM-DD HH:mm:ss")}${info.correlation} [${info.level.toUpperCase()}] <${process.env.LIM_VERSION || ""}> ${info.name}: ${info.message?.trim()}`
        )),

        transports: [
            new transports.File({
                dirname: config.logging.logDirectory,
                filename: config.logging.logFilename,
                level: config.logging.logLevel,

            }),
            new transports.Console({
                stderrLevels: [], level: config.logging.logLevel,
            })
        ]
    });

    if (isDevEnv) {
        logger.add(
            new transports.File({
                level: "silly",
                dirname: config.logging.logDirectory,
                filename: `${config.logging.logFilename.replace(".log", "_silly.log")}`,
            }),
        );
    }

    return logger;
}

export class LimLogger {
    private readonly logMeta: { correlation: string, name: string };

    constructor(correlationId: string, loggerName: string = "") {
        const name = [loggerBasePath, LimLogger.parseLoggerName(loggerName)].join('.');
        const correlation = correlationId ? ` [${correlationId}]` : "";

        this.logMeta = {correlation, name};
    }

    private static parseLoggerName(filepath: string): string {
        if (filepath.indexOf(path.sep) >= 0) {
            filepath = filepath.replace(process.cwd() + path.sep, '')
                .replace(`src${path.sep}`, '')
                .replace(`dist${path.sep}`, '')
                .replace('.ts', '')
                .replace('.js', '')
                .split(path.sep)
                .join('.');
        }
        return filepath;
    }

    silly(msg: string): void {
        globalLogger.silly(msg, this.logMeta);
    }

    debug(msg: string): void {
        globalLogger.debug(msg, this.logMeta);
    }

    info(msg: string): void {
        globalLogger.info(msg, this.logMeta);
    }

    warning(msg: string): void {
        globalLogger.warn(msg, this.logMeta);
    }

    error(msg: string): void {
        globalLogger.error(msg, this.logMeta);
    }
}
