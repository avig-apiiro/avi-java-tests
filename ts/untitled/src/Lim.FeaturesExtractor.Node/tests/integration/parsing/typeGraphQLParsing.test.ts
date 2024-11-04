import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import {getTestContext, runParserFlow} from "../integrationTestUtils";
import {
    GqlDeclaration,
    GqlObjectType,
    GqlOperationType,
    GqlResolverClass,
    GqlResolverSnippet
} from "../../../src/models/graphql/graphqlEntities";
import {instanceOfChecker} from "../../../src/internals/TypeUtils";

chai.use(chaiArrays);

describe('Test type-graphql parsing', () => {
    const testContext = getTestContext("TypeGraphQL");

    before(async () => {
        await runParserFlow(testContext);
    });

    describe("GraphQL Types", () => {
        it("parses object type with different field forms", () => {
            const simpleObjectType = findTypeByName("ObjectWithPrimitiveFields")
            expect(simpleObjectType).to.not.be.undefined;

            const fieldNameToType = new Map(simpleObjectType!.fields.map(field => [field.name, field.type.toString()]));
            expect(fieldNameToType).to.deep.equal(new Map(Object.entries({
                inferredStringField: "String",
                conciseTypedStringField: "String",
                verboseTypedStringField: "String",
                intField: "Int",
                inferredFloatField: "Float",
                typedFloatField: "Float",
                nestedArrayField: "[[ExplicitlyNamedObjectType]]",
                computedField: "Float",
                getterField: "Int"
            })));
        });

        it("parses explicitly named types and fields", () => {
            const explicitlyNamedObjectType = findTypeByName("ExplicitlyNamedObjectType")!;
            expect(explicitlyNamedObjectType).to.not.be.undefined;

            const explicitlyNamedField = explicitlyNamedObjectType.fields.find(field => field.name == "explicitlyNamedField")!;
            expect(explicitlyNamedField).to.not.be.undefined;
            expect(explicitlyNamedField.type.toString()).to.equal("Int")
        });

        it("parses qualified decorators and types", () => {
            const qualifiedDecoratorObjectType = findTypeByName("QualifiedDecoratorObject");
            expect(qualifiedDecoratorObjectType).to.not.be.undefined;

            const idsField = qualifiedDecoratorObjectType!.fields.find(field => field.name == "ids")!;
            expect(idsField).to.not.be.undefined;
            expect(idsField.type.toString()).to.equal("[ID]")
        });
    });

    describe("GraphQL Resolvers", () => {
        it("parses simple query", () => {
            const declaration = findOperationResolver(GqlOperationType.Query, "simpleQuery")!;
            expect(declaration).to.not.be.undefined;
            expect(declaration.type.toString()).to.equal("ExplicitlyNamedObjectType");
        })

        it("parses async query with type", () => {
            const declaration = findOperationResolver(GqlOperationType.Query, "asyncTypedQuery")!;
            expect(declaration).to.not.be.undefined;
            expect(declaration.type.toString()).to.equal("[ExplicitlyNamedObjectType]");
        })

        it("parses sync query with type", () => {
            const declaration = findOperationResolver(GqlOperationType.Query, "syncTypedQuery")!;
            expect(declaration).to.not.be.undefined;
            expect(declaration.type.toString()).to.equal("[ExplicitlyNamedObjectType]");
        })

        it("parses query with explicit name", () => {
            const declaration = findOperationResolver(GqlOperationType.Query, "getObjects")!;
            expect(declaration).to.not.be.undefined;
            expect(declaration.type.toString()).to.equal("[ExplicitlyNamedObjectType]");
        })

        it("parses simple mutation", () => {
            const declaration = findOperationResolver(GqlOperationType.Mutation, "createObject")!;
            expect(declaration).to.not.be.undefined;
            expect(declaration.type.toString()).to.equal("Boolean");
        })

        it("parses field resolver", () => {
            const declaration = findFieldResolver("ObjectWithPrimitiveFields", "nestedArrayField")!;
            expect(declaration).to.not.be.undefined;
            expect(declaration.type.toString()).to.equal("[ExplicitlyNamedObjectType]");
        })

        it("parses query on typed resolver", () => {
            const declaration = findOperationResolver(GqlOperationType.Query, "queryOnTypeResolver")!;
            expect(declaration).to.not.be.undefined;
            expect(declaration.type.toString()).to.equal("ObjectWithPrimitiveFields");
        })

        it("creates implicit top-level operation types", () => {
            const queryType = testContext.parserState.gqlDeclarations
                .filter(instanceOfChecker(GqlObjectType))
                .find(objectType => objectType.name === "Query" && objectType.fields.find(field => field.name === "simpleQuery"))!;

            expect(queryType).to.be.not.be.undefined;
            expect(queryType.codeReference.relativeFilePath).to.equal("resolvers.ts");
            expect(Object.fromEntries(queryType.fields.map(_ => [_.name, _.type.toString()]))).to.deep.equal({
                "simpleQuery": "ExplicitlyNamedObjectType",
                "asyncTypedQuery": "[ExplicitlyNamedObjectType]",
                "syncTypedQuery": "[ExplicitlyNamedObjectType]",
                "getObjects": "[ExplicitlyNamedObjectType]"
            })

            const mutationType = testContext.parserState.gqlDeclarations
                .filter(instanceOfChecker(GqlObjectType))
                .find(objectType => objectType.name === "Mutation" && objectType.fields.find(field => field.name === "createObject"))!;
            expect(mutationType).to.not.be.undefined;
            expect(Object.fromEntries(mutationType.fields.map(_ => [_.name, _.type.toString()]))).to.deep.equal({
                "createObject": "Boolean"
            });
        })

        it("sets resolver code reference for field resolvers", () => {
            const resolver = findFieldResolver("ObjectWithPrimitiveFields", "nestedArrayField");
            const objectType = findTypeByName("ObjectWithPrimitiveFields");
            const field = objectType?.fields.find(_ => _.name === "nestedArrayField");
            expect(field?.resolverReference).to.equal(resolver?.codeReference);
        })
    });

    function findDeclaration<T extends GqlDeclaration>(type: new(..._: any[]) => T, predicate: ((item: T) => boolean) = _ => true): T | undefined {
        return testContext.parserState.gqlDeclarations.find(
            declaration => declaration instanceof type && predicate(declaration)
        ) as T | undefined;
    }

    function findTypeByName(name: string): GqlObjectType | undefined {
        return findDeclaration(GqlObjectType, _ => _.name === name);
    }

    function findFieldResolver(parentType: string, name: string): GqlResolverSnippet | undefined {
        const resolverClass = findDeclaration(GqlResolverClass, _ => _.targetType?.toString() === parentType);
        return resolverClass?.resolvers.find(_ => _.name === name);
    }

    function findOperationResolver(operationType: GqlOperationType, name: string): GqlResolverSnippet | undefined {
        for (const declaration of testContext.parserState.gqlDeclarations) {
            if (!(declaration instanceof GqlResolverClass)) {
                continue;
            }
            const snippet = declaration.resolvers.find(_ => _.operationType === operationType && _.name === name);
            if (snippet) {
                return snippet;
            }
        }
        return undefined;
    }
});


