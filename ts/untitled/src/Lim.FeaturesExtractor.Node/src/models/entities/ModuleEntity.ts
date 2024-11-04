import ts from "typescript";
import {Memoize} from 'typescript-memoize';
import {isClientModule} from "../../parser/visitors/utils/nodeClientCodeUtils";
import {ClientModuleDetectedError} from "../../types/Errors";
import {EntityBase} from "./EntityBase";
import {EntityKey} from "./EntityKey";
import {ImportEntity} from "./ImportEntity";

export class ModuleEntity extends EntityBase {
    private _importEntities: ImportEntity[] = [];

    constructor(fileFullPath: string) {
        super(new EntityKey(fileFullPath, {line: 0, character: 0}, {line: 0, character: 0}, ts.SyntaxKind.SourceFile));
    }

    get importedEntities() {
        return this._importEntities;
    }

    @Memoize()
    get externalImportedModuleNames(): string[] {
        return this.importedEntities.filter(importEntity => !importEntity.isLocal()).map(importEntity => importEntity.moduleSpecifier);
    }

    // TODO: properly handle merging of 2 import entities in case there are 2 rows representing imports from same module
    addModuleImport(importEntity: ImportEntity) {
        if (isClientModule(importEntity.moduleSpecifier)) {
            throw new ClientModuleDetectedError();
        }

        this._importEntities.push(importEntity);
    }

    hasImport = (importedModuleName: string): boolean => (
        this._importEntities.some(importEntity => importEntity.moduleSpecifier === importedModuleName)
    );
}
