import {isEmpty} from "lodash";
import ts from "typescript";
import {LimLogger} from "../../internals/Logger";
import {EntityKey} from "../../models/entities/EntityKey";
import {Context} from "../../types/Context";
import {ClientModuleDetectedError} from "../../types/Errors";
import {ParserState} from "../state/ParserState";

export interface IVisitor {
    shouldVisit(node: ts.Node): boolean;

    visitBeforeChildren(node: ts.Node, entityKey: EntityKey): void;

    visitAfterChildren(node: ts.Node, entityKey: EntityKey): void;
}

export abstract class VisitorBase<TNode extends ts.Node> implements IVisitor {
    logger: LimLogger;

    protected constructor(public typeChecker: ts.TypeChecker, public parserContext: Context, visitorLogName: string) {
        this.logger = new LimLogger(parserContext.correlationId, visitorLogName);
    }

    protected get parserState(): ParserState {
        return this.parserContext.parserState;
    }

    abstract shouldVisit(node: ts.Node): node is TNode;

    visitBeforeChildren(node: ts.Node, entityKey: EntityKey) {
        this.tryWithErrorLogging(this.visitBeforeChildrenImpl, node, entityKey);
    }

    visitAfterChildren(node: ts.Node, entityKey: EntityKey) {
        this.tryWithErrorLogging(this.visitAfterChildrenImpl, node, entityKey);
    }

    protected abstract visitBeforeChildrenImpl(node: TNode, entityKey: EntityKey): void;

    protected visitAfterChildrenImpl(node: TNode, entityKey: EntityKey): void {
    }

    private tryWithErrorLogging(func: (node: ts.Node, entityKey: EntityKey) => void, node: ts.Node, entityKey: EntityKey) {
        try {
            func = func.bind(this);
            func(node as TNode, entityKey);
        } catch (error) {
            if (error instanceof ClientModuleDetectedError) {
                throw error;
            }

            if (!shouldDismissError(error, entityKey.type)) {
                this.logger.error(`Failed to visit node.\n${error.stack}`);
            }
        }
    };
}

export function shouldDismissError(error: Error, nodeType: number): boolean {
    const errorMessage = error.toString();

    return errorsToIgnore.some(error =>
        (isEmpty(error.tsKinds) || error.tsKinds.includes(nodeType)) &&
        error.messages.includes(errorMessage)
    );
}

const errorsToIgnore: { tsKinds: ts.SyntaxKind[], messages: string[] }[] = [
    {
        tsKinds: [
            ts.SyntaxKind.CallExpression,
            ts.SyntaxKind.FunctionExpression,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.MethodDeclaration
        ],
        messages: [
            "TypeError: Cannot read property 'flags' of undefined",
            "Error: Debug Failure. False expression: Class was missing valueDeclaration -OR- non-class had no interface declarations",
        ]
    },
    {
        tsKinds: [
            ts.SyntaxKind.CallExpression
        ],
        messages: [
            "Error: Debug Failure. Did not expect CallExpression to have an Identifier in its trivia",
            "Error: Debug Failure. False expression."
        ]
    }
];
