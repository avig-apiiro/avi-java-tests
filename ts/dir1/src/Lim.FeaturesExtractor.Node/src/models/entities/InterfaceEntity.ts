import {EntityKey} from "./EntityKey";
import {SnippetEntity, SnippetType} from "./SnippetEntity";

// TODO: This is temporary inheritance, since will be written to api features.
export class InterfaceEntity extends SnippetEntity {
    snippetType = SnippetType.InterfaceDeclaration;

    methodCount: number;
    propertyNameToType: Map<string, string> = new Map<string, string>();

    constructor(entityKey: EntityKey, readonly name: string) {
        super(entityKey);
    }

    addProperty = (propertyName: string, propertyType: string) => this.propertyNameToType.set(propertyName, propertyType);
}

