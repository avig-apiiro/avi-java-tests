import {createWrappedNode, InterfaceDeclaration} from "ts-morph";
import ts from "typescript";
import {EntityKey} from "../../models/entities/EntityKey";
import {InterfaceEntity} from "../../models/entities/InterfaceEntity";
import {Context} from "../../types/Context";
import {getNodeTypeString} from "./utils/nodeCommonUtils";
import {VisitorBase} from "./VisitorBase";

export class InterfaceVisitor extends VisitorBase<ts.InterfaceDeclaration> {
    shouldVisit = ts.isInterfaceDeclaration;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.InterfaceDeclaration, entityKey: EntityKey): void {
        const wrappedNode = createWrappedNode(node, {typeChecker: this.typeChecker}) as InterfaceDeclaration;
        const interfaceEntity = new InterfaceEntity(entityKey, wrappedNode.getName());

        interfaceEntity.methodCount = wrappedNode.getMethods().length;
        wrappedNode.getProperties().forEach(property => {
            let nodeTypeString = getNodeTypeString(property.compilerNode, this.typeChecker, this.parserContext);
            if (nodeTypeString != "lambda") {
                interfaceEntity.addProperty(
                    property.getName(),
                    nodeTypeString
                );
            } else {
                interfaceEntity.methodCount++;
            }
        });

        this.parserState.setInterfaceEntity(interfaceEntity);
    }
}
