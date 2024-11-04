import {FeaturesEntityContext} from "../../features/types/EntityContext";
import {SnippetEntity, SnippetType} from "../entities/SnippetEntity";
import {MethodEntityViewFunctionLike} from "./MethodEntityViewFunctionLike";
import {FunctionLikeEntity} from "../entities/FunctionLikeEntity";

export function MethodEntityViewFactory(entity: SnippetEntity, entityContext: FeaturesEntityContext): MethodEntityViewFunctionLike | undefined {
    if (entity.snippetType === SnippetType.FunctionDeclaration){
        return new MethodEntityViewFunctionLike(entity as FunctionLikeEntity);
    }
    return undefined;
}