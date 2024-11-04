import {SnippetEntity, SnippetType} from "../entities/SnippetEntity";

export interface IEntityView {
    entity: SnippetEntity;

    getSnippetType(): SnippetType;
}
