import {SnippetEntity, SnippetType} from "../entities/SnippetEntity";
import {IEntityView} from "./IEntityView";

export abstract class EntityViewBase<TSnippetEntity extends SnippetEntity> implements IEntityView {
    readonly entity: TSnippetEntity;

    constructor(entity: TSnippetEntity) {
        this.entity = entity;
    }

    getSnippetType(): SnippetType {
        return this.entity.snippetType;
    }
}
