import {EntityKey} from "./EntityKey";
import {SnippetEntity} from "./SnippetEntity";

export class EntityReference {
    constructor(readonly key: EntityKey) {
    }

    private _entity?: SnippetEntity;

    public get entity(): SnippetEntity | undefined {
        return this._entity;
    };

    public get isResolved(): boolean {
        return this._entity != undefined;
    }

    public resolveWith(entity: SnippetEntity | undefined) {
        if (entity != undefined && entity.key.keyString() !== this.key.keyString()) {
            throw new Error(`Attempt to resolve entity reference '${this.key.keyString()}' with mismatching entity '${entity?.key.keyString()}' (${entity?.snippetType}`);
        }
        this._entity = entity;
    }
}

export interface EntityReferenceSource {
    getEntityReferences(): ReadonlyArray<EntityReference>
}
