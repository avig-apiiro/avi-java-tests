import {createWrappedNode, Decorator} from "ts-morph";
import ts from "typescript";
import {DecoratorEntity} from "../../models/entities/DecoratorEntity";
import {EntityKey} from "../../models/entities/EntityKey";
import {Context} from "../../types/Context";
import {getNodeEntityKey} from "./utils/nodeCommonUtils";
import {getDecoratorCallExpression} from "./utils/nodeDecoratorUtils";
import {VisitorBase} from "./VisitorBase";

function formatArgument(argument: string): string {
    return argument.replace(/['"]/g, '');
}

export class DecoratorVisitor extends VisitorBase<ts.Decorator> {
    shouldVisit = ts.isDecorator;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.Decorator, entityKey: EntityKey): void {
        const wrappedDecorator = createWrappedNode(node, {typeChecker: this.typeChecker}) as Decorator;

        const decoratorEntity = new DecoratorEntity(entityKey);
        try {
            decoratorEntity.decoratorName = wrappedDecorator.getName();
            decoratorEntity.decoratorArguments = wrappedDecorator.getArguments().map(argument => formatArgument(argument.getText()));
        } catch (error) {
            decoratorEntity.decoratorName = "???"
            decoratorEntity.decoratorArguments = []
        }
        try {
            const decoratorCallExpression = getDecoratorCallExpression(node);
            if (decoratorCallExpression) {
                decoratorEntity.callExpressionKey = getNodeEntityKey(decoratorCallExpression, entityKey.path);
            }
        } catch (error) {
        }

        if (ts.isClassDeclaration(node.parent)) {
            const classKey = this.parserState.getCurrentClassKeyString();
            if (classKey !== undefined) {
                this.parserState.classEntitiesByKey.get(classKey)?.decorators.push(decoratorEntity);
            }
        }
    }
}
