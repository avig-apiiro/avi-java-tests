import ts from "typescript";
import {EntityKey} from "../../models/entities/EntityKey";
import {DeclarationImportEntity} from "../../models/entities/ImportEntity";
import {Context} from "../../types/Context";
import {VisitorBase} from "./VisitorBase";

export class ImportsVisitor extends VisitorBase<ts.ImportDeclaration> {
    shouldVisit = ts.isImportDeclaration;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.ImportDeclaration, entityKey: EntityKey): void {
        const importEntity = new DeclarationImportEntity(entityKey, node.moduleSpecifier.getText());

        const clauses = node.importClause;
        const namedImportNode = clauses?.getChildAt(0);
        if (clauses && namedImportNode && ts.isNamedImports(namedImportNode)) {
            importEntity.isNamedImport = true;
            namedImportNode.elements.forEach(importElement => importEntity.appendImportClause(importElement.name.getText()));
        } else {
            importEntity.isNamedImport = false;
            if (node.importClause) {
                importEntity.appendImportClause(node.importClause.getText());
            }
        }

        this.parserState.moduleEntitiesByName.get(entityKey.path)?.addModuleImport(importEntity);
    }
}
