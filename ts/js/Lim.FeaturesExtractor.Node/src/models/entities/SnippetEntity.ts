import {EntityBase} from "./EntityBase";
import {EntityReference, EntityReferenceSource} from "./EntityReference";

export enum SnippetType {
    CallExpression = 'CallExpression',
    NewExpression = 'NewExpression',
    FunctionDeclaration = 'FunctionDeclaration',
    InterfaceDeclaration = 'InterfaceDeclaration',
    ClassDeclaration = 'ClassDeclaration'
}

export abstract class SnippetEntity extends EntityBase implements EntityReferenceSource {
    snippetType: SnippetType;

    classKey: string;
    variableDeclarationName: string;

    getEntityReferences(): ReadonlyArray<EntityReference> {
        return [];
    }
}


