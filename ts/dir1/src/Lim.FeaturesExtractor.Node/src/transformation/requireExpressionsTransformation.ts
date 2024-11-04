import path from "path";
import ts from "typescript";
import {TextChange, textChangeForNode, TextChangeGenerator} from "./textChanges";

export const requireExpressionsChangeGenerator: TextChangeGenerator = function requireExpressionsChangeGenerator(sourceFile: ts.SourceFile): TextChange[] {
    const changes: TextChange[] = [];
    sourceFile.forEachChild(collectRequireExpressionChanges);

    function collectRequireExpressionChanges(node: ts.Node) {
        node.forEachChild(collectRequireExpressionChanges);

        if (!ts.isCallExpression(node)) {
            return;
        }

        const callTarget = node.expression;
        if (!(ts.isIdentifier(callTarget) && callTarget.text === 'require')) {
            return;
        }

        const argumentNodes = node.arguments;
        const rewrittenArgumentNodes = ts.transform([...argumentNodes], [resolveFilenameOperationsTransformation]).transformed;
        argumentNodes.forEach((argNode, index) => {
            const rewrittenArgNode = rewrittenArgumentNodes[index];
            if (rewrittenArgNode !== argNode && ts.isStringLiteral(rewrittenArgNode)) {
                changes.push(textChangeForNode(JSON.stringify(rewrittenArgNode.text), argNode));
            }
        });
    }

    return changes;
};

function resolveFilenameOperationsTransformation<T>(context: ts.TransformationContext) {
    const resolveFilenameOperations: ts.Transformer<ts.Expression> = (node: ts.Expression) => {
        if (ts.isStringLiteral(node)) {
            return node;
        }

        node = ts.visitEachChild(node, resolveFilenameOperations, context);

        // Replace literal `__dirname` with `'.'` (they are equivalent inside `require()`)
        if (ts.isIdentifier(node) && node.text === '__dirname') {
            return ts.createStringLiteral(".");
        }

        // Replace string literal concatenation with concatenated literal
        // `'./' + 'userController'` => `'./userController'`
        if (ts.isBinaryExpression(node) &&
            node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            const parts = [node.left, node.right];
            if (!parts.every(ts.isStringLiteral)) {
                return node;
            }

            const joinedPath = (parts as ts.StringLiteral[]).map(part => part.text).join("");
            return ts.createStringLiteral(joinedPath);
        }

        // Replace path.join calls with result of path.join
        // `path.join("x", "y", "z")` => `"x/y/z"`
        if (ts.isCallExpression(node) &&
            isPathJoinCall(node) &&
            node.arguments.every(ts.isStringLiteral)
        ) {
            let joinedPath = "./" + path.join(...node.arguments.map(arg => (arg as ts.StringLiteral).text));
            return ts.createStringLiteral(joinedPath);
        }

        // Replace string templates containing only string literals as embedded expressions
        // with resulting string literal (this can happen if embedded expressions were transformed
        // by some other means)
        // `${"x"}/y/z` => "/x/y/z"
        if (ts.isTemplateExpression(node) && node.templateSpans.every(span => ts.isStringLiteral(span.expression))) {
            const parts = [node.head.text].concat(
                ...node.templateSpans.map(span => [(span.expression as ts.StringLiteral).text, span.literal.text]));
            const joinedString = parts.join('');
            return ts.createStringLiteral(joinedString);
        }

        return node;

        function isPathJoinCall(callExpression: ts.CallExpression) {
            const callee = callExpression.expression;
            if (!ts.isPropertyAccessExpression(callee)) {
                return false;
            }

            if (callee.name.text !== 'join') {
                return false;
            }

            const target = callee.expression;
            if (!ts.isIdentifier(target)) {
                return false;
            }

            if (target.text !== 'path') {
                return false;
            }

            return true;
        }
    };

    return resolveFilenameOperations;
}
