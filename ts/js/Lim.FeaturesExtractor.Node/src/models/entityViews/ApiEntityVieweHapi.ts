import ts from "typescript";
import {Memoize} from "typescript-memoize";
import {ObjectMap} from "../../parser/visitors/utils/nodeObjectLiteralUtils";
import {CallExpressionEntity} from "../entities/CallLikeEntities";
import {EntityViewBase} from "./EntityViewBase";
import {IApiEntityView} from "./IApiEntityView";

const maxSnippetLengh = 150
export class ApiEntityVieweHapi extends EntityViewBase<CallExpressionEntity> implements IApiEntityView {
    @Memoize()
    get hapiConfig(): ObjectMap {
        return this.entity.callExpressionArguments[0].objectValue!;
    }

    static isHapi(entity: CallExpressionEntity): boolean {
        const invokesRoute = () => entity.callExpressionFuncName === "route";
        const matchesSignature = () => entity.matchesSignature([
            configArg =>
                configArg.kind === ts.SyntaxKind.ObjectLiteralExpression &&
                ["method", "path"].every(prop => typeof configArg.objectValue?.[prop] === 'string')
        ]);

        return invokesRoute() && matchesSignature();
    }

    getSuspectedApiMethod(): string | undefined {
        return this.hapiConfig["method"] as string;
    }
    getDisplayString(): string | undefined {
        return this.entity.displayString.substring(0, maxSnippetLengh)
    }

    getSuspectedApiRoute(): string | undefined {
        return this.hapiConfig["path"] as string;
    }
}
