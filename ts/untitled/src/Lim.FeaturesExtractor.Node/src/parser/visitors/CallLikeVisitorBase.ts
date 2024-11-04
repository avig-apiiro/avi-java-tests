import ts, {createNode, Expression} from "typescript";
import {CallLikeEntity} from "../../models/entities/CallLikeEntities";
import {EntityKey} from "../../models/entities/EntityKey";
import {Context} from "../../types/Context";
import {isArgumentSymbolLike} from "./utils/nodeCallExpressionUtils";
import {getNodeEntityKeyByContext, getNodeTypeString} from "./utils/nodeCommonUtils";
import {followNodeToDeclaration} from "./utils/nodeFollowUtils";
import {getObjectLiteralValue, ObjectMap} from "./utils/nodeObjectLiteralUtils";
import {VisitorBase} from "./VisitorBase";

export abstract class CallLikeVisitorBase<TNode extends (ts.CallExpression | ts.NewExpression), TEntity extends CallLikeEntity> extends VisitorBase<TNode> {

    protected registerMethodCall(expression: Expression) {
        const {
            functionUniqueName,
            isInternal
        } = getMethodUniqueNameWithReferencedEntityKey(this.typeChecker, this.parserContext, expression, getArgReferencedEntityKey(expression, this.typeChecker, this.parserContext));
        if (functionUniqueName === undefined) {
            return false;
        }
        const currentMethodKeyString = this.parserState.getCurrentMethodKeyString();
        const functionLikeEntity = this.parserState.functionLikeEntitiesByKey.get(currentMethodKeyString);
        if (isInternal) {
            functionLikeEntity?.internalMethodCalls.push(functionUniqueName);
        } else {
            functionLikeEntity?.externalMethodCalls.push(functionUniqueName);
        }
    }

    protected getArgInternalOrExternalMethodName(arg: Expression, argReferencedEntityKey?: EntityKey): { internalMethodUniqueName: string | undefined, externalMethodUniqueName: string | undefined } {
        const {
            functionUniqueName,
            isInternal
        } = getMethodUniqueNameWithReferencedEntityKey(this.typeChecker, this.parserContext, arg, argReferencedEntityKey);
        return {
            internalMethodUniqueName: isInternal ? functionUniqueName : undefined,
            externalMethodUniqueName: isInternal || ts.isStringLiteral(arg) ? undefined : functionUniqueName
        };
    }

    protected registerArgMethods(entity: TEntity, arg: Expression, argReferencedEntityKey?: EntityKey): void {
        if (ts.isArrayLiteralExpression(arg)) {
            arg.elements.forEach(element => this.registerArgMethods(entity, element, getArgReferencedEntityKey(element, this.typeChecker, this.parserContext)), this);
            return;
        }
        const {
            functionUniqueName,
            isInternal
        } = getMethodUniqueNameWithReferencedEntityKey(this.typeChecker, this.parserContext, arg, argReferencedEntityKey);
        if (functionUniqueName !== undefined) {
            if (isInternal) {
                entity.InternalReferencedMethods.push(functionUniqueName);
            } else {
                entity.ExternalReferencedMethods.push(functionUniqueName);
            }
        }
    }

    protected populateEntityInformation(entity: TEntity, node: TNode) {
        const typeChecker = this.typeChecker;
        const targetExpression = node.expression;
        this.registerMethodCall(node);
        entity.classKey = this.parserState.getCurrentClassKeyString();
        entity.processCallLeftHand(targetExpression.getText(), targetExpression, typeChecker, this.parserContext);

        node.arguments?.forEach(arg => {
            const [literalValue, kind] = getArgLiteralValueAndKind(arg);
            const argReferencedEntityKey = getArgReferencedEntityKey(arg, typeChecker, this.parserContext);
            this.registerArgMethods(entity, arg, argReferencedEntityKey);
            entity.addArgument(
                kind,
                typeChecker.getTypeAtLocation(arg),
                getNodeTypeString(arg, typeChecker, this.parserContext),
                literalValue ?? "",
                getArgObjectMap(arg),
                argReferencedEntityKey
            );
        });
    }
}

function getArgLiteralValueAndKind(arg: ts.Expression): [string | undefined, ts.SyntaxKind] {
    if (ts.isStringLiteral(arg)) {
        return [`\`${arg.text}\``, arg.kind];
    }
    if (ts.isTemplateExpression(arg)) {
        return [arg.getText(), arg.kind];
    }
    if (isArgumentSymbolLike(arg)) {
        return [arg.getText(), arg.kind];
    }
    if (ts.isBinaryExpression(arg) && arg.operatorToken.kind == ts.SyntaxKind.PlusToken) {
        const concatenatedValue = concatenateStrings([arg.left, arg.right])
        if (concatenatedValue !== undefined) {
            return [concatenatedValue, ts.SyntaxKind.TemplateExpression];
        }
    }

    return [undefined, arg.kind];
}

function concatenateStrings(values: ts.Expression[]): string | undefined {
    const literalLikeKinds = [ts.SyntaxKind.StringLiteral, ts.SyntaxKind.TemplateExpression];
    const literalValuesAndKinds = values.map(getArgLiteralValueAndKind);

    if (literalValuesAndKinds.some(([value, _]) => value === undefined)) {
        return undefined;
    }

    if (!literalValuesAndKinds.some(([_, kind]) => literalLikeKinds.includes(kind))) {
        return undefined;
    }

    const quotedValues = literalValuesAndKinds.map(([value, kind]) =>
        literalLikeKinds.includes(kind) ?
            value?.substring(1, value?.length - 1) :
            `\${${value}}`
    );
    return `\`${quotedValues.join("")}\``;
}

function getArgObjectMap(arg: ts.Expression): ObjectMap {
    return (ts.isObjectLiteralExpression(arg)) ? getObjectLiteralValue(arg) : {};
}

function getArgReferencedEntityKey(arg: ts.Expression, typeChecker: ts.TypeChecker, context: Context): EntityKey | undefined {
    const referencedNode = followNodeToDeclaration(arg, typeChecker);
    return getNodeEntityKeyByContext(referencedNode, context);
}

function isFunctionLikeEntityKey(entityKey: EntityKey): boolean {
    return ts.isFunctionLike(createNode(entityKey.type));
}

function isExternalPath(path: string) {
    return path.startsWith("../");
}

function getMethodUniqueNameWithReferencedEntityKey(typeChecker: ts.TypeChecker, context: Context, expression: Expression, referencedEntityKey?: EntityKey): { functionUniqueName: string | undefined, isInternal: boolean } {
    if (ts.isNewExpression(expression)) {
        const signature = typeChecker.getResolvedSignature(expression);
        const signatureDeclaration = signature?.declaration;
        if (signatureDeclaration !== undefined && !ts.isJSDocSignature(signatureDeclaration)) {
            referencedEntityKey = getNodeEntityKeyByContext(signatureDeclaration, context);
        }
    } else if (ts.isCallExpression(expression)) {
        referencedEntityKey = getArgReferencedEntityKey(expression.expression, typeChecker, context);
    }
    if (referencedEntityKey !== undefined && isFunctionLikeEntityKey(referencedEntityKey) && !isExternalPath(referencedEntityKey.path)) {
        return {functionUniqueName: referencedEntityKey.keyString(), isInternal: true};
    }
    if (ts.isNewExpression(expression) || ts.isCallExpression(expression)) {
        return {functionUniqueName: expression.expression.getText(), isInternal: false};
    }
    if (ts.isIdentifier(expression)) {
        return {functionUniqueName: expression.text, isInternal: false};
    }
    return {functionUniqueName: undefined, isInternal: false};
}

