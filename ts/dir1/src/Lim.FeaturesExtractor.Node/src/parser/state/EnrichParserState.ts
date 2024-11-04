import _ from "lodash";
import isEmpty from "lodash/isEmpty";
import {LimLogger} from "../../internals/Logger";
import {executeWithLogAsync} from "../../internals/LoggingUtils";
import {CallExpressionEntity} from "../../models/entities/CallLikeEntities";
import {ClassEntity} from "../../models/entities/ClassEntity";
import {SnippetEntity, SnippetType} from "../../models/entities/SnippetEntity";
import {appFrameworkMethods} from "../../types/AppFrameworkMethods";
import {Context} from "../../types/Context";
import {httpMethods} from "../../types/HttpMethods";
import {ParserState} from "./ParserState";
import {
    GqlTypeReference,
    GqlClassTypeReference,
    GqlListTypeReference,
    GqlNamedTypeReference,
    GqlObjectType,
    GqlOperationType,
    GqlField,
    GqlResolverClass
} from "../../models/graphql/graphqlEntities";
import {instanceOfChecker} from "../../internals/TypeUtils";
import {groupBy, mapBy} from "../../internals/collectionUtils";

const stringExpressionRegex: RegExp = /\${\w+}/g;

export async function enrichParserState(parserContext: Context): Promise<void> {
    const logger = new LimLogger(parserContext.correlationId, __filename);

    await executeWithLogAsync(logger, "parser state enrichment", () => enrich());

    function enrich() {
        parserContext.throwIfCancelled();

        // Cross-entity enrichment
        resolveEntityReferences(parserContext.parserState);

        // Call expression enrichment
        parserContext.parserState.callExpressionEntitiesByKey.forEach(callExpressionEntity => {
            enrichSnippetWithArgValuesAndStringLiterals(callExpressionEntity);
            enrichCallExpressionWithImports(callExpressionEntity);
        });
        enrichCallExpressionsWithSiblings();

        // Class enrichment
        enrichClassesWithConstructorProperties();
        enrichClassesWithInheritedProperties();

        // GraphQL enrichment
        enrichGraphQLTypes();
    }

    // Call expression declaration enrichment
    function enrichSnippetWithArgValuesAndStringLiterals(snippetEntity: SnippetEntity) {
        if (snippetEntity.snippetType === SnippetType.CallExpression) {
            let callExpressionEntity = snippetEntity as CallExpressionEntity;
            callExpressionEntity.callExpressionArguments.forEach(argument => {
                if (argument.literalValue !== undefined) {
                    argument.literalValue = replaceStringConstants(argument.literalValue);
                }
            });
            if (callExpressionEntity.rootRoutePath !== undefined) {
                callExpressionEntity.rootRoutePath = replaceStringConstants(callExpressionEntity.rootRoutePath);
            }
        }

        function replaceStringConstants(literalValue: string) {
            if (isEmpty(literalValue)) {
                return literalValue;
            }
            if (literalValue.startsWith('`')) {
                literalValue.match(stringExpressionRegex)?.forEach(match => {
                    const symbol = match.replace("${", "").replace("}", "");
                    const newLiteralValue = parserContext.parserState.stringLiteralsBySymbol.get(symbol);
                    if (newLiteralValue) {
                        literalValue = literalValue.replace(match, newLiteralValue);
                    }
                });
                literalValue = literalValue.replace(/`/g, "");
            } else if (parserContext.parserState.stringLiteralsBySymbol.has(literalValue)) {
                return parserContext.parserState.stringLiteralsBySymbol.get(literalValue);
            }
            return literalValue;
        }
    }

    function enrichCallExpressionsWithSiblings() {
        const httpMethodsSet = new Set(httpMethods);
        const appFrameworkMethodsSet = new Set(appFrameworkMethods);

        const snippetEntities = parserContext.parserState.getEntities(SnippetType.CallExpression) as CallExpressionEntity[];
        const methodInvocationEntities = snippetEntities.filter(snippet => snippet.callExpressionIsPropertyAccess);
        _(methodInvocationEntities)
            .groupBy((entity: CallExpressionEntity) => entity.key.path)
            .forIn(sameModuleEntities => _(sameModuleEntities)
                .groupBy((entity: CallExpressionEntity) => entity.methodInvocationOwnerText)
                .forIn(sameOwnerEntities => sameOwnerEntities
                    .forEach((entity: CallExpressionEntity) => {

                        const siblingMethodCounts = _.countBy(sameOwnerEntities, sibling => sibling.methodInvocationMethodName);

                        const countMethods = (methodsList: Set<string>): number => _(siblingMethodCounts)
                            .filter((count, methodName) => methodsList.has(methodName))
                            .sum();

                        const httpMethodsCount = countMethods(httpMethodsSet);
                        const appFrameworkMethodsCount = countMethods(appFrameworkMethodsSet);

                        entity.siblingsInfo = {
                            methodCounts: siblingMethodCounts,
                            httpMethodsCount: httpMethodsCount,
                            appFrameworkMethodsCount: appFrameworkMethodsCount,
                            otherMethodCount: sameOwnerEntities.length - httpMethodsCount - appFrameworkMethodsCount
                        };
                    })
                )
            );
    }

    function enrichCallExpressionWithImports(callExpressionEntity: CallExpressionEntity) {
        callExpressionEntity.moduleImportsServer = parserContext.parserState.moduleEntitiesByName.get(callExpressionEntity.key.path)?.hasImport("server") ?? false;
    }

    function resolveEntityReferences(parserState: ParserState) {
        const entities = parserState.getEntities();
        entities.forEach(entity => {
            try {
                entity.getEntityReferences().forEach(entityRef => entityRef.resolveWith(parserState.findEntity(entityRef.key)));
            } catch (error) {
                logger.error(`Error resolving entity references for '${SnippetType[entity.snippetType]}' entity '${entity.key.keyString()}':\n${error.stack}`);
            }
        });
    }

    // Class declaration enrichment
    function enrichClassesWithInheritedProperties() {
        const classEntitiesById = parserContext.parserState.classEntitiesByKey;
        for (const classEntity of classEntitiesById.values()) {
            populateInheritedClassProperties(classEntity);
        }

        function populateInheritedClassProperties(classEntity: ClassEntity) {
            if (classEntity.inheritedPropertyNameToType !== undefined) {
                return;
            }

            if (classEntity.extendedClassKey === undefined) {
                classEntity.inheritedClassPropertyNameToType = new Map<string, string>();
                return;
            }

            const extendedClassKey = classEntity.extendedClassKey.keyString();
            if (!classEntitiesById.has(extendedClassKey)) {
                classEntity.inheritedClassPropertyNameToType = new Map<string, string>();
                return;
            }

            const extendedClass = classEntitiesById.get(extendedClassKey);
            if (extendedClass !== undefined) {
                populateInheritedClassProperties(extendedClass);
                classEntity.inheritedPropertyNameToType = extendedClass.getClassPropertyNameToType();
            }
        }
    }

    function enrichClassesWithConstructorProperties() {
        for (const functionEntity of parserContext.parserState.functionLikeEntitiesByKey.values()) {
            if (!functionEntity.isConstructor) {
                continue;
            }
            const classEntity = parserContext.parserState.classEntitiesByKey.get(functionEntity.classKey);
            if (!classEntity) {
                continue;
            }

            for (const propertyName of functionEntity.thisAssignedMembers) {
                if (!classEntity.propertyNameToType.has(propertyName)) {
                    classEntity.addProperty(propertyName, "any");
                }
            }
        }
    }

    function enrichGraphQLTypes() {
        const gqlDeclarations = parserContext.parserState.gqlDeclarations;
        const objectTypes = gqlDeclarations.filter(instanceOfChecker(GqlObjectType));
        const resolverClasses = gqlDeclarations.filter(instanceOfChecker(GqlResolverClass));

        resolveSymbolicTypes();
        joinResolversToTypes();

        function resolveSymbolicTypes() {
            const typesByKey = mapBy(objectTypes, _ => _.entityKey.keyString());

            function resolveClassTypeReferences(typeReference: GqlTypeReference) {
                if (typeReference instanceof GqlClassTypeReference) {
                    const target = typesByKey.get(typeReference.targetKey.keyString());
                    if (target) {
                        typeReference.resolve(new GqlNamedTypeReference(target.name));
                    }
                } else if (typeReference instanceof GqlListTypeReference) {
                    resolveClassTypeReferences(typeReference.elementType);
                }
            }

            gqlDeclarations.forEach(declaration => {
                if (declaration instanceof GqlResolverClass || declaration instanceof GqlObjectType) {
                    declaration.getTypeReferences().forEach(resolveClassTypeReferences);
                }
            })
        }

        function joinResolversToTypes() {
            const typesByName = mapBy(objectTypes, _ => _.name);

            for (const resolverClass of resolverClasses) {
                const targetTypeFields = (resolverClass.targetType && typesByName.get(resolverClass.targetType.toString())?.fields) ?? [];
                const snippetsByOperationType = groupBy(resolverClass.resolvers, _ => _.operationType ?? null);

                for (const [operationType, snippets] of snippetsByOperationType) {
                    if (operationType == null) {
                        snippets.forEach(snippet => {
                            const targetField = targetTypeFields.find(_ => _.name === snippet.name);
                            if (targetField) {
                                targetField.resolverReference = snippet.codeReference;
                            }
                        });
                    } else {
                        const impliedTopLevelType = new GqlObjectType(
                            resolverClass.entityKey,
                            GqlOperationType[operationType],
                            snippets.map(snippet => new GqlField(snippet.codeReference, snippet.name, snippet.type, snippet.codeReference)),
                            [])

                        gqlDeclarations.push(impliedTopLevelType);
                    }
                }
            }
        }
    }
}
