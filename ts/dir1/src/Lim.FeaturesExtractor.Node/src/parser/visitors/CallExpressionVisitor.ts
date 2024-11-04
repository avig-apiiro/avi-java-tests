import _ from "lodash";
import ts from "typescript";
import {CallExpressionEntity} from "../../models/entities/CallLikeEntities";
import {EntityKey} from "../../models/entities/EntityKey";
import {RequireImportEntity} from "../../models/entities/ImportEntity";
import {Context} from "../../types/Context";
import {ParserState} from "../state/ParserState";
import {CallLikeVisitorBase} from "./CallLikeVisitorBase";
import {httpMethods} from "../../types/HttpMethods";

export class CallExpressionVisitor extends CallLikeVisitorBase<ts.CallExpression, CallExpressionEntity> {
    shouldVisit = ts.isCallExpression;
    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.CallExpression, entityKey: EntityKey): void {
        const snippetEntity = new CallExpressionEntity(entityKey);
        this.parserState.callExpressionStack.push(entityKey);
        snippetEntity.displayString = node.getText()
        snippetEntity.variableDeclarationName = this.parserState.getCurrentVariableDeclaration();

        this.populateEntityInformation(snippetEntity, node);
        snippetEntity.callExpressionIsDecorator = ts.isDecorator(node.parent);

        const callExpressionHandlers = [RequireHandler, ExpressRouteHandler].map(handler => new handler(node, entityKey, this.parserState));

        callExpressionHandlers.forEach(handler => {
            if (handler.shouldExecuteLogic(snippetEntity)) {
                handler.executeLogic(node, snippetEntity);
            }
        });

        if (!this.shouldDismissEntity(snippetEntity)) {
            this.parserState.setCallExpressionEntity(snippetEntity);
            this.parserState.innerApiDetector.addCall(entityKey);
        }

        const classKey = this.parserState.getCurrentClassKeyString();
        if (classKey !== undefined) {
            const classEntity = this.parserState.classEntitiesByKey.get(classKey)
            const routingControllersDefinedRoute = classEntity?.getRoutingControllersDefinedRoute()
            if (routingControllersDefinedRoute !== undefined) {
                snippetEntity.routingControllersRootRoutePath = routingControllersDefinedRoute;
            }
            const nestJsDefinedRoute = classEntity?.getNestJsDefinedRoute();
            if (nestJsDefinedRoute !== undefined) {
                snippetEntity.nestJsRootRoutePath = nestJsDefinedRoute;
            }
        }
    }

    protected visitAfterChildrenImpl(node: ts.CallExpression, entityKey: EntityKey): void {
        const entity = this.parserState.getCallExpressionEntity(entityKey);
        if (entity == null) {
            return;
        }

        this.parserState.innerApiDetector.setNoApiFlag(entityKey);
        if (this.parserState.innerApiDetector.isEndOfCallChain(entityKey)) {
            this.markNoApi();
            this.parserState.innerApiDetector.reset();
        }

        if (this.parserState.rootRoutePathDefinition && node.getText().includes(this.parserState.rootRoutePathDefinition)) {
            entity.rootRoutePath = this.parserState.rootRoutePath;
        } else {
            entity.rootRoutePath = undefined;
        }

        this.parserState.callExpressionStack.pop();
        if (this.parserState.callExpressionStack.isEmpty()) {
            this.parserState.rootRoutePath = undefined;
        }
    }

    private markNoApi(): void {
        for (let entityKey of this.parserState.innerApiDetector.notApisList) {
            const callExpressionEntity = this.parserState.getCallExpressionEntity(entityKey);
            callExpressionEntity.shouldRemoveApi = true;
        }
    }

    private shouldDismissEntity(snippetEntity: CallExpressionEntity): boolean {
        if (snippetEntity.callExpressionFullText.startsWith("console.")) {
            this.logger.silly("Dismissing console.*");
            return true;
        }

        const hasHttpMethodName = () => httpMethods.includes(snippetEntity.callExpressionFullText.toLowerCase());

        if (_.isEmpty(snippetEntity.callExpressionArguments) && !hasHttpMethodName()) {
            this.logger.silly("Dismissing call expression with no args");
            return true;
        }

        return false;
    }
}

abstract class SpecificExpressionCallHandler {
    constructor(readonly callExpression: ts.CallExpression, readonly entityKey: EntityKey, readonly parserState: ParserState) {
    }

    get sourceFilePath() {
        return this.entityKey.path;
    }

    abstract shouldExecuteLogic(snippetExpression: CallExpressionEntity): boolean;

    abstract executeLogic(node: ts.CallExpression, snippetEntity: CallExpressionEntity): void
}

class ExpressRouteHandler extends SpecificExpressionCallHandler {

    executeLogic(node: ts.CallExpression, snippetEntity: CallExpressionEntity): void {
        this.parserState.rootRoutePath = snippetEntity.firstArgString;
        this.parserState.rootRoutePathDefinition = node.getText();
    }

    shouldExecuteLogic(snippetEntity: CallExpressionEntity): boolean {
        return snippetEntity.methodInvocationMethodName == "route";
    }
}

class RequireHandler extends SpecificExpressionCallHandler {
    shouldExecuteLogic(snippetEntity: CallExpressionEntity): boolean {
        const expression = this.callExpression.expression;

        return (
            expression.kind == ts.SyntaxKind.Identifier
            && expression.getText() === "require"
            && this.callExpression.arguments.length === 1
        );
    }

    executeLogic(node: ts.CallExpression, snippetEntity: CallExpressionEntity): void {
        const importEntity = new RequireImportEntity(this.entityKey, this.callExpression.arguments[0].getText());

        if (ts.isVariableDeclaration(this.callExpression.parent)) {
            const varDeclarationParent = this.callExpression.parent as ts.VariableDeclaration;
            importEntity.importVarIdentifier = varDeclarationParent.name.getText();
        }

        this.parserState.moduleEntitiesByName.get(this.sourceFilePath)?.addModuleImport(importEntity);
    }
}
