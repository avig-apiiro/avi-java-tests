import {EntityBase} from "./EntityBase";
import {EntityKey} from "./EntityKey";

export class ImportEntity extends EntityBase {
    readonly moduleSpecifier: string;

    constructor(entityKey: EntityKey, moduleSpecifier: string) {
        super(entityKey);
        this.moduleSpecifier = moduleSpecifier.split("'").join("").split('"').join("");
    }

    isLocal = () => this.moduleSpecifier.startsWith(".");
}

export class DeclarationImportEntity extends ImportEntity {
    isNamedImport: boolean;
    private _importClauses: string[] = [];

    getImportClauses = () => this._importClauses;
    appendImportClause = (importClause: string) => this._importClauses.push(importClause);
}

export class RequireImportEntity extends ImportEntity {
    importVarIdentifier: string;
}
