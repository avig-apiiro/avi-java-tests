import ts from "typescript";
import {VisitorBase} from "./VisitorBase";
import {Context} from "../../types/Context";
import {EntityKey} from "../../models/entities/EntityKey";
import {TypeGraphQLResolverExtractor, TypeGraphQLTypeExtractor} from "../graphql/TypeGraphQLTypeExtractor";

export class TypeGraphQLVisitor extends VisitorBase<ts.ClassDeclaration> {
    shouldVisit = ts.isClassDeclaration;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.ClassDeclaration, entityKey: EntityKey): void {
        const objectType = new TypeGraphQLTypeExtractor(entityKey.path, this.typeChecker, this.parserContext).extractTypeGraphQLObjectDeclaration(node);
        if (objectType) {
            this.parserContext.parserState.gqlDeclarations.push(objectType);
        }

        const resolverClass = new TypeGraphQLResolverExtractor(entityKey.path, this.typeChecker, this.parserContext).extractTypeGraphQLResolverClass(node);
        if (resolverClass) {
            this.parserContext.parserState.gqlDeclarations.push(resolverClass);
        }
    }
}
