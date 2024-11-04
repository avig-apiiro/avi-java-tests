import LRU from "lru-cache";
import {config} from "../config";
import {baseResultsPath} from "../internals/consts";
import {ParserState} from "../parser/state/ParserState";
import {ParseCancelled} from "./Errors";

export class Context {
    parserState: ParserState;
    outputDirectoryPath: string = baseResultsPath;
    compressOutput: boolean = config.app.compressOutput;

    typesCache = new LRU(config.app.typesCacheSize);

    constructor(readonly correlationId: string, private path: string | undefined = undefined, readonly isCancelled: (() => boolean) | undefined = undefined) {
        this.parserState = new ParserState();
    }

    get directoryPath(): string {
        if (this.path === undefined) {
            throw Error(`Directory path not set for correlation ID ${this.correlationId}`);
        }
        return this.path;
    }

    set directoryPath(directoryPath: string) {
        this.path = directoryPath;
    }

    static setupContext(correlationId: string, isCancelled: (() => boolean) | undefined, path: string | undefined = undefined): Context {
        return new Context(correlationId, path, isCancelled);
    }

    throwIfCancelled() {
        if (this.isCancelled && this.isCancelled()) {
            throw new ParseCancelled(`Processing [${this.correlationId}] was cancelled`);
        }
    }
}
