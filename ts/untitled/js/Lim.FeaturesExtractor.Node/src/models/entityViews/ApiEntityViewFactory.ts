import {FeaturesEntityContext} from "../../features/types/EntityContext";
import {CallExpressionEntity} from "../entities/CallLikeEntities";
import {SnippetEntity, SnippetType} from "../entities/SnippetEntity";
import {ApiEntityViewCallExpression} from "./ApiEntityViewCallExpression";
import {ApiEntityVieweHapi} from "./ApiEntityVieweHapi";
import {IApiEntityView} from "./IApiEntityView";
import {httpMethods} from "../../types/HttpMethods";
import {ApiEntityViewPapaya} from "./ApiEntityViewPapaya";

export function ApiEntityViewFactory(entity: SnippetEntity, _entityContext: FeaturesEntityContext): IApiEntityView | undefined {
    switch (entity.snippetType) {

        case SnippetType.CallExpression:
            const callExpressionEntity = entity as CallExpressionEntity;

            if (shouldDismissCallExpression(callExpressionEntity)) {
                return undefined;
            }

            return ApiEntityVieweHapi.isHapi(callExpressionEntity) ? new ApiEntityVieweHapi(callExpressionEntity) :
                ApiEntityViewPapaya.isPapaya(callExpressionEntity) ? new ApiEntityViewPapaya(callExpressionEntity) :
                    new ApiEntityViewCallExpression(callExpressionEntity);

        default:
            return undefined;
    }
}

function shouldDismissCallExpression(callExpressionEntity: CallExpressionEntity): boolean {
    // Dismiss non method invocation (except for decorators) as an attempt to reduce the number of API snippets we process
    // thus improving the memory consumption in the pipeline following the features extraction.
    return !callExpressionEntity.callExpressionIsPropertyAccess && !callExpressionEntity.callExpressionIsDecorator &&
        !httpMethods.includes(callExpressionEntity.callExpressionFuncName);
}
