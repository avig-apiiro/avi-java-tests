import ts from "typescript";
import {EntityKey} from "./EntityKey";

export abstract class EntityBase {
    constructor(readonly key: EntityKey) {
    }

    get path(): string {
        return this.key.path;
    };

    get line(): number {
        return this.key.start.line + 1;
    };

    get endLine(): number {
        return this.key.end.line + 1;
    };

    getTypeString = (): string => ts.SyntaxKind[this.key.type];

    getUid = (): string => this.key.keyString();
}
