import _ from "lodash"
import ts from "typescript";
import {EntityKey} from "../../models/entities/EntityKey";
import {Context} from "../../types/Context";
import {VisitorBase} from "./VisitorBase";

export class VariableDeclarationVisitor extends VisitorBase<ts.VariableDeclarationList> {
    shouldVisit = ts.isVariableDeclarationList;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.VariableDeclarationList, entityKey: EntityKey): void {
        const name =  !_.isEmpty(node.declarations) ? node.declarations[0].name.getText() : "";
        this.parserContext.parserState.variableDeclarationStack.push(name);

    }

    protected visitAfterChildrenImpl(node: ts.VariableDeclarationList, entityKey: EntityKey): void {
        this.parserContext.parserState.variableDeclarationStack.pop();
    }
}
