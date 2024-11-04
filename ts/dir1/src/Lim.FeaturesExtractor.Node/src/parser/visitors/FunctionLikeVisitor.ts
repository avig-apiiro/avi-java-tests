import _ from "lodash";
import ts from "typescript";
import {EntityKey} from "../../models/entities/EntityKey";
import {FunctionLikeEntity, FunctionType} from "../../models/entities/FunctionLikeEntity";
import {Context} from "../../types/Context";
import {hasDeclarationModifier} from "./utils/nodeCommonUtils";
import {bodyContains, getBodyLength} from "./utils/nodeSourceFileUtils";
import {VisitorBase} from "./VisitorBase";

export class FunctionLikeVisitor extends VisitorBase<ts.SignatureDeclaration> {
    shouldVisit = ts.isFunctionLike;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.SignatureDeclaration, entityKey: EntityKey): void {
        const functionLikeEntity = new FunctionLikeEntity(entityKey);
        functionLikeEntity.classKey = this.parserState.getCurrentClassKeyString();
        functionLikeEntity.bodyLength = getBodyLength(node);
        functionLikeEntity.containsAuthentication = bodyContains(node, "authenticate(") || bodyContains(node, "auth(");

        switch (node.kind) {
            case ts.SyntaxKind.MethodDeclaration:
                functionLikeEntity.functionType = FunctionType.method;
                break;

            case ts.SyntaxKind.FunctionDeclaration:
                functionLikeEntity.functionType = FunctionType.functionDeclaration;
                break;

            case ts.SyntaxKind.FunctionExpression:
                functionLikeEntity.functionType = FunctionType.functionExpression;
                break;

            case ts.SyntaxKind.ArrowFunction:
                functionLikeEntity.functionType = FunctionType.arrowFunction;
                break;

            case ts.SyntaxKind.Constructor:
                functionLikeEntity.functionType = FunctionType.constructor;
                functionLikeEntity.isConstructor = true;
                break;

            case ts.SyntaxKind.GetAccessor:
                functionLikeEntity.functionType = FunctionType.getter;
                functionLikeEntity.isGetter = true;
                break;

            case ts.SyntaxKind.SetAccessor:
                functionLikeEntity.functionType = FunctionType.setter;
                functionLikeEntity.isSetter = true;
                break;

            default:
                functionLikeEntity.functionType = FunctionType.other;
                this.logger.silly(`Encountered an "other" function type. Node key = ${entityKey.keyString()}`);
                break;
        }

        const signature = this.typeChecker.getSignatureFromDeclaration(node);

        if (signature !== undefined) {
            const returnType = this.typeChecker.getReturnTypeOfSignature(signature);
            functionLikeEntity.returnType = this.typeChecker.typeToString(returnType);
        }

        node.parameters.forEach(param => {
            const name = param.name.getText();
            const type = param.type ? param.type.getText() : "";
            functionLikeEntity.addParameter(name, type);
        });

        const symbol = this.typeChecker.getSymbolAtLocation(node);
        if (symbol) {
            functionLikeEntity.functionName = symbol.name;
            functionLikeEntity.hasDoc = ts.displayPartsToString(symbol.getDocumentationComment(this.typeChecker)).length > 0;
        }

        functionLikeEntity.isPrivate = hasDeclarationModifier(node, ts.ModifierFlags.Private);
        functionLikeEntity.isAbstract = hasDeclarationModifier(node, ts.ModifierFlags.Abstract);

        if (!this.shouldDismissEntity(functionLikeEntity)) {
            this.parserState.setFunctionDeclarationEntity(functionLikeEntity);
        }
    }

    private shouldDismissEntity(snippetEntity: FunctionLikeEntity): boolean {
        if (_.isEmpty(snippetEntity.getParameters())) {
            this.logger.silly("Dismissing function like declaration with no parameters");
            return true;
        }

        return false;
    }
}
