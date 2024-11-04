import {FeaturesEntityContext} from "../../features/types/EntityContext";
import {SnippetEntity} from "../entities/SnippetEntity";
import {IEntityView} from "./IEntityView";

export type TEntityViewFactory<TEntityView extends IEntityView> = (entity: SnippetEntity, entityContext: FeaturesEntityContext) => TEntityView | undefined;
