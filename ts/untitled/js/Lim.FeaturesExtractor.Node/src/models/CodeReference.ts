// NOTE: This class should be JSON-compatible with its C# counterpart!
import {EntityKey} from "./entities/EntityKey";

export class CodeReference {
    constructor(
        public relativeFilePath: string,
        public lineNumber: number,
        public lastLineInFile: number = 0
    ) {
    }

    public static fromEntityKey(entityKey: EntityKey): CodeReference {
        return new CodeReference(entityKey.path, entityKey.start.line + 1, entityKey.end.line + 1);
    }
}