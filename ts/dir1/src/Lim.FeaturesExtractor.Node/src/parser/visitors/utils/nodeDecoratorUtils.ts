import ts from "typescript";
import {extractSimpleName} from "./nodeCommonUtils";

export function getDecoratorCallExpression(decoratorNode: ts.Decorator): ts.CallExpression | undefined {
    return ts.isCallExpression(decoratorNode.expression) ? decoratorNode.expression : undefined;
}

export function findNamedDecoratorExpression(declaration: ts.NamedDeclaration, decoratorName: string): ts.CallExpression | undefined {
    return declaration.decorators
        ?.map(getDecoratorCallExpression)
        .find(decoratorExpression => extractSimpleName(decoratorExpression?.expression) === decoratorName)
        ?? undefined;
}

