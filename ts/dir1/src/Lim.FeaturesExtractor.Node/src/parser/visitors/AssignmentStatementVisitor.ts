import {VisitorBase} from "./VisitorBase";
import ts from "typescript";
import {EntityKey} from "../../models/entities/EntityKey";
import {Context} from "../../types/Context";

export class AssignmentStatementVisitor extends VisitorBase<ts.ExpressionStatement> {
    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    shouldVisit = ts.isExpressionStatement

    protected visitBeforeChildrenImpl(node: ts.ExpressionStatement, entityKey: EntityKey): void {
        const containingFunctionKey = this.parserState.getCurrentMethodKeyString();
        const containingFunction = this.parserState.functionLikeEntitiesByKey.get(containingFunctionKey);

        if (containingFunction === undefined) {
            return;
        }

        const expression = node.expression;
        if (
            ts.isBinaryExpression(expression) && expression.operatorToken.kind == ts.SyntaxKind.EqualsToken &&
            ts.isPropertyAccessExpression(expression.left) && expression.left.expression.kind == ts.SyntaxKind.ThisKeyword &&
            ts.isIdentifier(expression.left.name)
        ) {
            containingFunction.thisAssignedMembers.push(expression.left.name.text);
        }
    }
}