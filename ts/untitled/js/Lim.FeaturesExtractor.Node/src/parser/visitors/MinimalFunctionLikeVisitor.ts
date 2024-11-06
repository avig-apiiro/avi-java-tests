import ts from "typescript";
import {EntityKey} from "../../models/entities/EntityKey";
import {FunctionLikeEntity, FunctionType} from "../../models/entities/FunctionLikeEntity";
import {Context} from "../../types/Context";
import {getMethodName, getNodeEntityKeyByContext} from "./utils/nodeCommonUtils";
import {VisitorBase} from "./VisitorBase";

export class MinimalFunctionLikeVisitor extends VisitorBase<ts.SignatureDeclaration> {
    shouldVisit = ts.isFunctionLike;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.SignatureDeclaration, entityKey: EntityKey): void {
        this.parserContext.parserState.methodStack.push(entityKey);

        const functionLikeEntity = new FunctionLikeEntity(entityKey);
        functionLikeEntity.uniqueName = getNodeEntityKeyByContext(node, this.parserContext).keyString();
        functionLikeEntity.classKey = this.parserState.getCurrentClassKeyString();

        const {name, isRealName} = getMethodName(node);
        functionLikeEntity.functionName = name;
        functionLikeEntity.isRealName = isRealName;

        node.parameters.forEach(param => {
            const name = param.name.getText();
            const type = param.type ? param.type.getText() : "";
            functionLikeEntity.addParameter(name, type);
        });

        functionLikeEntity.functionType = syntaxKindToFunctionType.get(node.kind) ?? FunctionType.other;
        functionLikeEntity.isConstructor = (functionLikeEntity.functionType === FunctionType.constructor);
        functionLikeEntity.isGetter = (functionLikeEntity.functionType === FunctionType.getter);
        functionLikeEntity.isSetter = (functionLikeEntity.functionType === FunctionType.setter);

        this.parserState.setFunctionDeclarationEntity(functionLikeEntity);
    }

    protected visitAfterChildrenImpl(node: ts.SignatureDeclaration, entityKey: EntityKey): void {
        this.parserContext.parserState.methodStack.pop();
    }
}

const syntaxKindToFunctionType: Map<ts.SyntaxKind, FunctionType> = new Map([
    [ts.SyntaxKind.Constructor, FunctionType.constructor],
    [ts.SyntaxKind.MethodDeclaration, FunctionType.method],
    [ts.SyntaxKind.FunctionDeclaration, FunctionType.functionDeclaration],
    [ts.SyntaxKind.FunctionExpression, FunctionType.functionExpression],
    [ts.SyntaxKind.ArrowFunction, FunctionType.arrowFunction],
    [ts.SyntaxKind.GetAccessor, FunctionType.getter],
    [ts.SyntaxKind.SetAccessor, FunctionType.setter]
]);