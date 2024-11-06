import ts from "typescript";
import {
    GqlClassTypeReference,
    GqlField,
    GqlListTypeReference,
    GqlNamedTypeReference,
    GqlObjectType,
    GqlOperationType,
    GqlResolverClass,
    GqlResolverSnippet,
    GqlTypeReference
} from "../../models/graphql/graphqlEntities";
import {getObjectLiteralPropertyValue} from "../visitors/utils/nodeObjectLiteralUtils";
import {
    extractSimpleName,
    getNodeCodeReference,
    getNodeEntityKey,
    getNodeEntityKeyByContext
} from "../visitors/utils/nodeCommonUtils";
import {findNamedDecoratorExpression} from "../visitors/utils/nodeDecoratorUtils";
import {followNodeToDeclaration} from "../visitors/utils/nodeFollowUtils";
import {Context} from "../../types/Context";
import {instanceOfChecker} from "../../internals/TypeUtils";

const TypeGraphQLNames = {
    ObjectTypeDecorator: "ObjectType",
    FieldDecorator: "Field",
    ResolverDecorator: "Resolver",
    QueryDecorator: "Query",
    MutationDecorator: "Mutation",
    SubscriptionDecorator: "Subscription",
    FieldResolverDecorator: "FieldResolver",
    NameArgument: "name",
    ImplementsArgument: "implements"
};

const GqlPrimitiveTypes = {
    ID: new GqlNamedTypeReference("ID"),
    Int: new GqlNamedTypeReference("Int"),
    Float: new GqlNamedTypeReference("Float"),
    String: new GqlNamedTypeReference("String"),
    Boolean: new GqlNamedTypeReference("Boolean"),
}

abstract class TypeGraphQLExtractorBase {
    protected constructor(
        protected readonly sourceFilePath: string,
        protected readonly typeChecker: ts.TypeChecker,
        protected readonly context: Context
    ) {
    }

    protected parseTypeFromTypeFuncOrDeclaration(typeFunc: ts.ArrowFunction | undefined, declaration: ts.ClassElement) {
        return typeFunc ?
            this.parseTypeFromTypeFunc(typeFunc) :
            this.parseTypeFromDeclaredType(this.getClassElementType(declaration));
    }

    protected parseTypeFromExpression(expr: ts.Expression): GqlTypeReference | undefined {
        const self = this;

        return (
            tryParsePrimitiveType(expr) ??
            tryParseArrayType(expr) ??
            tryParseClassType(expr) ??
            tryParseSimpleNameType(expr) ??
            undefined
        );

        function tryParsePrimitiveType(expr: ts.Expression) {
            if (ts.isIdentifier(expr) && expr.text in GqlPrimitiveTypes) {
                return GqlPrimitiveTypes[expr.text];
            }
            return undefined;
        }

        function tryParseArrayType(expr: ts.Expression) {
            if (ts.isArrayLiteralExpression(expr)) {
                const elementType = self.parseTypeFromExpression(expr.elements[0]);
                if (!!elementType) {
                    return new GqlListTypeReference(elementType);
                }
            }
            return undefined;
        }

        function tryParseClassType(expr: ts.Expression) {
            const declaration = followNodeToDeclaration(expr, self.typeChecker);
            if (ts.isClassDeclaration(declaration)) {
                return new GqlClassTypeReference(getNodeEntityKeyByContext(declaration, self.context));
            }
            return undefined;
        }

        function tryParseSimpleNameType(expr: ts.Expression) {
            const simpleName = extractSimpleName(expr);
            if (!!simpleName) {
                return new GqlNamedTypeReference(simpleName);
            }
            return undefined;
        }
    }

    protected parseTypeFromTypeFunc(typeFunc: ts.ArrowFunction): GqlTypeReference | undefined {
        const body = typeFunc.body;

        if (ts.isBlock(body)) {
            return undefined;
        }

        return this.parseTypeFromExpression(body);
    }

    protected parseTypeFromDeclaredType(declaredType: ts.TypeNode | undefined): GqlTypeReference | undefined {
        if (!declaredType) {
            return undefined;
        }

        switch (declaredType.kind) {
            case ts.SyntaxKind.StringKeyword:
                return GqlPrimitiveTypes.String;

            case ts.SyntaxKind.BooleanKeyword:
                return GqlPrimitiveTypes.Boolean;

            case ts.SyntaxKind.NumberKeyword:
                return GqlPrimitiveTypes.Float;
        }

        if (ts.isArrayTypeNode(declaredType)) {
            // Technically isn't supported by type-graphql but let's be inclusive
            const elementType = this.parseTypeFromDeclaredType(declaredType.elementType);
            return !!elementType ? new GqlListTypeReference(elementType) : undefined;
        }

        if (!ts.isTypeReferenceNode(declaredType)) {
            return undefined;
        }

        const simpleTypeName =
            ts.isIdentifier(declaredType.typeName) ?
                declaredType.typeName.text :
                declaredType.typeName.right.text;

        if (simpleTypeName in GqlPrimitiveTypes) {
            return GqlPrimitiveTypes[simpleTypeName];
        }

        const declaration = followNodeToDeclaration(declaredType, this.typeChecker);
        if (ts.isClassDeclaration(declaration)) {
            return new GqlClassTypeReference(getNodeEntityKeyByContext(declaration, this.context));
        }

        return undefined;
    }

    protected extractNameFromDeclaration(declaration: ts.ClassElement): string | undefined {
        let declarationName = declaration.name;
        if (declarationName == undefined) {
            return undefined;
        }

        if (ts.isIdentifier(declarationName)) {
            return declarationName.text;
        }

        if (ts.isStringLiteral(declarationName)) {
            return declarationName.text;
        }

        return undefined;
    }

    protected extractNameFromDecoratorOptions(optionsExpression: ts.ObjectLiteralExpression | undefined): string | undefined {
        if (!optionsExpression) {
            return undefined;
        }

        const namePropertyValue = getObjectLiteralPropertyValue(optionsExpression, TypeGraphQLNames.NameArgument);

        return typeof namePropertyValue === "string" ?
            namePropertyValue :
            undefined;
    }

    protected getClassElementType(classElement: ts.ClassElement): ts.TypeNode | undefined {
        if (ts.isPropertyDeclaration(classElement) ||
            ts.isMethodDeclaration(classElement) ||
            ts.isGetAccessorDeclaration(classElement)) {
            return classElement.type;
        }

        return undefined;
    }

}

export class TypeGraphQLTypeExtractor extends TypeGraphQLExtractorBase {
    constructor(sourceFilePath: string, typeChecker: ts.TypeChecker, context: Context) {
        super(sourceFilePath, typeChecker, context);
    }

    public extractTypeGraphQLObjectDeclaration(classDeclaration: ts.ClassDeclaration): GqlObjectType | undefined {
        const decoratorExpression = findNamedDecoratorExpression(classDeclaration, TypeGraphQLNames.ObjectTypeDecorator);
        if (!decoratorExpression) {
            return undefined;
        }

        const name = this.extractTypeName(classDeclaration, decoratorExpression);
        if (!name) {
            return undefined;
        }

        const fields = this.extractTypeFields(classDeclaration);
        const interfaces = this.extractInterfaces(decoratorExpression);
        return new GqlObjectType(
            getNodeEntityKey(classDeclaration, this.sourceFilePath),
            name,
            fields,
            interfaces);
    }

    private extractTypeName(node: ts.ClassDeclaration, decoratorExpression: ts.CallExpression): string | undefined {
        const args = decoratorExpression.arguments;
        return args.length >= 1 && ts.isStringLiteral(args[0]) ?
            (args[0] as ts.StringLiteral).text :
            node.name?.text;
    }

    private extractTypeFields(classDeclaration: ts.ClassDeclaration): GqlField[] {
        const fields: GqlField[] = [];

        for (const memberDeclaration of classDeclaration.members) {
            if (!(memberDeclaration.name && ts.isIdentifier(memberDeclaration.name))) {
                continue;
            }

            const decoratorExpression = findNamedDecoratorExpression(memberDeclaration, TypeGraphQLNames.FieldDecorator);
            if (!decoratorExpression) {
                continue;
            }

            const field = this.extractField(memberDeclaration, decoratorExpression);
            if (field) {
                fields.push(field);
            }
        }
        return fields;
    }

    private extractField(declaration: ts.ClassElement, decoratorExpression: ts.CallExpression): GqlField | undefined {
        const {typeFunc, optionsExpression} = this.parseFieldDecoratorParams(decoratorExpression);

        const name =
            this.extractNameFromDecoratorOptions(optionsExpression) ??
            this.extractNameFromDeclaration(declaration) ??
            undefined;

        if (!name) {
            return undefined;
        }

        const type = this.parseTypeFromTypeFuncOrDeclaration(typeFunc, declaration);
        if (!type) {
            return undefined;
        }

        return new GqlField(
            getNodeCodeReference(declaration, this.sourceFilePath),
            name,
            type
        );
    }

    private parseFieldDecoratorParams(decoratorExpression: ts.CallExpression):
        { typeFunc?: ts.ArrowFunction, optionsExpression?: ts.ObjectLiteralExpression } {
        const [maybeTypeFuncOrOptions, maybeOptions] = decoratorExpression.arguments;
        let result: { typeFunc?: ts.ArrowFunction, optionsExpression?: ts.ObjectLiteralExpression } = {}

        if (!maybeTypeFuncOrOptions) {
            return result;
        }

        if (ts.isArrowFunction(maybeTypeFuncOrOptions)) {
            result.typeFunc = maybeTypeFuncOrOptions;
        }

        if (ts.isObjectLiteralExpression(maybeTypeFuncOrOptions)) {
            result.optionsExpression = maybeTypeFuncOrOptions;
        }

        if (maybeOptions && ts.isObjectLiteralExpression(maybeOptions)) {
            result.optionsExpression = maybeOptions;
        }

        return result;
    }

    private extractInterfaces(decoratorExpression: ts.CallExpression): GqlNamedTypeReference[] {
        const optionsExpression = decoratorExpression.arguments.find(ts.isObjectLiteralExpression);
        if (optionsExpression == undefined) {
            return [];
        }

        let implementsValue = (optionsExpression.properties.find(prop =>
            ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === TypeGraphQLNames.ImplementsArgument) as ts.PropertyAssignment | undefined)?.initializer;

        if (implementsValue == undefined) {
            return [];
        }

        const interfaceNames = ts.isArrayLiteralExpression(implementsValue) ?
            [...implementsValue.elements] :
            [implementsValue];

        return interfaceNames
            .map(interfaceName => this.parseTypeFromExpression(interfaceName))
            .filter(instanceOfChecker(GqlNamedTypeReference));
    }
}

export class TypeGraphQLResolverExtractor extends TypeGraphQLExtractorBase {
    public constructor(sourceFilePath: string, typeChecker: ts.TypeChecker, context: Context) {
        super(sourceFilePath, typeChecker, context)
    }

    public extractTypeGraphQLResolverClass(classDeclaration: ts.ClassDeclaration): GqlResolverClass | undefined {
        const classDecoratorExpression = findNamedDecoratorExpression(classDeclaration, TypeGraphQLNames.ResolverDecorator);
        if (!classDecoratorExpression) {
            return undefined;
        }

        const resolverSnippets: GqlResolverSnippet[] = [];
        const classTargetType = this.extractResolverClassTargetType(classDecoratorExpression);

        const decoratorNameOperationTypePairs: [string, GqlOperationType | undefined][] = [
            [TypeGraphQLNames.QueryDecorator, GqlOperationType.Query],
            [TypeGraphQLNames.MutationDecorator, GqlOperationType.Mutation],
            [TypeGraphQLNames.SubscriptionDecorator, GqlOperationType.Subscription]
        ];

        if (classTargetType) {
            decoratorNameOperationTypePairs.push([TypeGraphQLNames.FieldResolverDecorator, undefined]);
        }

        for (const memberDeclaration of classDeclaration.members) {
            if (!ts.isMethodDeclaration(memberDeclaration)) {
                continue;
            }

            for (const [decoratorName, operationType] of decoratorNameOperationTypePairs) {
                const memberDecoratorExpression = findNamedDecoratorExpression(memberDeclaration, decoratorName);
                if (!memberDecoratorExpression) {
                    continue;
                }

                const typeFunc = memberDecoratorExpression.arguments.find(ts.isArrowFunction);
                const optionsExpression = memberDecoratorExpression.arguments.find(ts.isObjectLiteralExpression);

                const name = this.extractNameFromDecoratorOptions(optionsExpression) ?? this.extractNameFromDeclaration(memberDeclaration);
                const type = this.parseTypeFromTypeFuncOrDeclaration(typeFunc, memberDeclaration);

                if (!name || !type) {
                    continue;
                }

                resolverSnippets.push(
                    new GqlResolverSnippet(
                        getNodeCodeReference(memberDeclaration, this.sourceFilePath),
                        operationType,
                        name,
                        type
                    ));
            }
        }

        if (resolverSnippets.length == 0) {
            return undefined;
        }

        return new GqlResolverClass(
            getNodeEntityKey(classDeclaration, this.sourceFilePath),
            classTargetType,
            resolverSnippets
        )
    }

    private extractResolverClassTargetType(decoratorExpression: ts.CallExpression): GqlTypeReference | undefined {
        const typeNameOrFunc = decoratorExpression.arguments[0];
        if (!typeNameOrFunc) {
            return undefined;
        }

        return ts.isArrowFunction(typeNameOrFunc) ?
            this.parseTypeFromTypeFunc(typeNameOrFunc) :
            this.parseTypeFromExpression(typeNameOrFunc);
    }
}
