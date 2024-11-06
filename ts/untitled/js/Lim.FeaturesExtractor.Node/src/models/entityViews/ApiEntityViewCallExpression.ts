import ts from "typescript";
import path from "path";
import {Memoize} from "typescript-memoize";
import {httpMethods} from "../../types/HttpMethods";
import {CallExpressionEntity} from "../entities/CallLikeEntities";
import {EntityViewBase} from "./EntityViewBase";
import {IApiEntityView} from "./IApiEntityView";
import {isRouteLike} from "../../features/providers/utils/apiUtils";

const maxSnippetLengh = 150
export class ApiEntityViewCallExpression extends EntityViewBase<CallExpressionEntity> implements IApiEntityView {
    @Memoize()
    get httpMethodName(): string | undefined {
        const methodName = this.entity.methodInvocationMethodName?.toLowerCase() ?? this.entity.callExpressionFullText.toLowerCase();
        if (httpMethods.includes(methodName) || methodName === 'all') {
            return methodName;
        }
        return undefined;
    }

    @Memoize()
    get firstArgString(): string | undefined {
        return this.entity.firstArgString;
    }

    getSuspectedApiMethod(): string | undefined {
        return this.httpMethodName;
    }

    getSuspectedApiRoute(): string | undefined {
        let suspectedApiRoutes: string[] = [];
        if (this.entity.routingControllersRootRoutePath !== undefined) {
            suspectedApiRoutes.push(`${this.entity.routingControllersRootRoutePath}${this.firstArgString ? this.firstArgString : ""}`);
        }
        if (this.entity.nestJsRootRoutePath !== undefined) {
            let subRoute = this.firstArgString ?? "";
            if (subRoute !== "" && this.entity.nestJsRootRoutePath != "/") {
                subRoute = `/${subRoute}`;
            }
            suspectedApiRoutes.push(`${this.entity.nestJsRootRoutePath}${subRoute}`);
        }
        if (this.entity.moduleImportsServer && this.firstArgString && !this.firstArgString.startsWith("/")) {
            const moduleName = path.parse(this.entity.key.path).name;
            suspectedApiRoutes.push(`/${moduleName}-${this.firstArgString}`);
        }
        for (let i = 0; i < suspectedApiRoutes.length; i++) {
            if (isRouteLike(suspectedApiRoutes[i])) {
                return suspectedApiRoutes[i];
            }
        }
        return this.firstArgString ?? this.entity.rootRoutePath;
    }

    getDisplayString(): string | undefined {
        return this.entity.displayString.substring(0, maxSnippetLengh);
    }

    getArgumentTypes(): ts.Type[] {
        return this.entity.callExpressionArguments.map(argument => argument.type);
    }
}
