import {Memoize} from "typescript-memoize";
import {FunctionLikeEntity} from "../entities/FunctionLikeEntity";
import {EntityViewBase} from "./EntityViewBase";
import {IApiEntityView} from "./IApiEntityView";

export class ApiEntityViewFunctionLike extends EntityViewBase<FunctionLikeEntity> implements IApiEntityView {
    getDisplayString(): string | undefined {
        return undefined;
    }

    getSuspectedApiMethod(): string | undefined {
        return undefined;
    }

    @Memoize()
    getSuspectedApiRoute(): string | undefined {
        return undefined;
    }
}
