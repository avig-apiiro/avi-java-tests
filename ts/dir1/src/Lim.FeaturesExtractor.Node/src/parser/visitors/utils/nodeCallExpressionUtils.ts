import ts from "typescript";

export function isArgumentSymbolLike(callArgument: ts.Node) {
    return ts.isPropertyAccessExpression(callArgument) || ts.isCallExpression(callArgument) || ts.isIdentifier(callArgument);
}
