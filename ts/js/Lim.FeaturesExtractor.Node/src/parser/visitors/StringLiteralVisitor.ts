import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import ts from "typescript";
import {EntityKey} from "../../models/entities/EntityKey";
import {Context} from "../../types/Context";
import {VisitorBase} from "./VisitorBase";

export class StringLiteralVisitor extends VisitorBase<ts.StringLiteral> {
    shouldVisit = ts.isStringLiteral;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.StringLiteral, entityKey: EntityKey): void {

        const text = node.text;
        if (isEmpty(text)) {
            return;
        }

        if (ts.isVariableDeclaration(node.parent)) {
            const variableName = get(node.parent, 'symbol.escapedName', '');
            if (!isEmpty(variableName)) {
                this.parserState.stringLiteralsBySymbol.set(variableName, text);
            }
            return;
        }

        const classKey = this.parserState.getCurrentClassKeyString();
        if (!this.parserState.classEntitiesByKey.has(classKey)) {
            // TODO - support out of class
            return;
        }
        if (this.parserState.classEntitiesByKey.get(classKey)?.className !== "RoutesFactory") {
            // TODO - support other files
            return;
        }

        let nodeIterator = node.parent;
        if (!ts.isPropertyAssignment(nodeIterator)) {
            // TODO - support other parent nodes
            return;
        }

        let fullAccessPath = "";
        while (nodeIterator != undefined) {
            if (ts.isSourceFile(nodeIterator)) {
                break;
            }
            const symbolName: string = get(nodeIterator, 'symbol.escapedName', '');
            if (isEmpty(symbolName)) {
                break;
            }
            if (symbolName !== "__object") {
                fullAccessPath = isEmpty(fullAccessPath) ? symbolName : `${symbolName}.${fullAccessPath}`;
            }
            nodeIterator = nodeIterator.parent;
        }
        if (isEmpty(fullAccessPath)) {
            return;
        }
        this.parserState.stringLiteralsBySymbol.set(fullAccessPath, text);
        if (fullAccessPath.endsWith(".pattern")) {
            this.parserState.stringLiteralsBySymbol.set(fullAccessPath.replace(".pattern", ".get()"), text);
        }
    }
}
