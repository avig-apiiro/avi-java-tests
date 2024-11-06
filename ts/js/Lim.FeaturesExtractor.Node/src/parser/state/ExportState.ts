import _ from "lodash";
import path from "path";
import {getApiFeaturesExtractor} from "../../features/extractors/ApiFeaturesExtractor";
import {getDataModelFeaturesExtractor} from "../../features/extractors/DataModelFeaturesExtractor";
import {FeaturesExtractor} from "../../features/extractors/FeaturesExtractor";
import {FeatureValue} from "../../features/providers/ProviderBase";
import {FeaturesEntityContext} from "../../features/types/EntityContext";
import {FilesWriter} from "../../internals/FilesWriter";
import {LimLogger} from "../../internals/Logger";
import {executeWithLogAsync} from "../../internals/LoggingUtils";
import {SnippetEntity} from "../../models/entities/SnippetEntity";
import {ApiEntityViewFactory} from "../../models/entityViews/ApiEntityViewFactory";
import {DataModelEntityViewFactory} from "../../models/entityViews/DataModelEntityViewFactory";
import {TEntityViewFactory} from "../../models/entityViews/EntityViewFactory";
import {IEntityView} from "../../models/entityViews/IEntityView";
import {Context} from "../../types/Context";
import {getMethodFeaturesExtractor} from "../../features/extractors/MethodFeaturesExtractor";
import {MethodEntityViewFactory} from "../../models/entityViews/MethodEntityViewFactory";
import {ModuleEntity} from "../../models/entities/ModuleEntity";
import {GqlObjectType} from "../../models/graphql/graphqlEntities";
import {instanceOfChecker} from "../../internals/TypeUtils";

enum EntityKind {
    api = "api",
    dataModel = "data_model",
    method = "method",
    sourceFile = "sourceFile"
}

type FeaturesFilterFunction = (featuresValues: FeatureValue[][], featureNames: string[]) => FeatureValue[][];

export async function exportParserState(parserContext: Context): Promise<Map<string, string>> {
    parserContext.throwIfCancelled();

    const logger = new LimLogger(parserContext.correlationId, __filename);

    return new Map<string, string>([
        ["ApiSnippet", await writeApiFeatures()],
        ["DataModelSnippet", await writeDataModelFeatures()],
        ["Method", await writeMethodFeatures()],
        ["GqlDeclaration", await writeGqlTypes()],
        ["SourceFile", await writeSourceFileFeatures()]
    ]);

    function writeApiFeatures() {
        return writeEntityViewFeatures(
            [
                ...parserContext.parserState.callExpressionEntitiesByKey.values(),
                ...parserContext.parserState.functionLikeEntitiesByKey.values(),
            ],
            getApiFeaturesExtractor(parserContext.directoryPath, parserContext.correlationId),
            ApiEntityViewFactory,
            filterPredictedApiFeatures,
            EntityKind.api,
            logger);
    }

    function writeDataModelFeatures() {
        return writeEntityViewFeatures(
            [
                ...parserContext.parserState.callExpressionEntitiesByKey.values(),
                ...parserContext.parserState.interfaceEntitiesByKey.values(),
                ...parserContext.parserState.classEntitiesByKey.values(),
                ...parserContext.parserState.functionLikeEntitiesByKey.values(),
            ],
            getDataModelFeaturesExtractor(parserContext.directoryPath, parserContext.correlationId),
            DataModelEntityViewFactory,
            (featuresValues: FeatureValue[][], featureNames: string[]) => featuresValues,
            EntityKind.dataModel,
            logger
        );
    }

    function writeMethodFeatures() {
        return writeEntityViewFeatures(
            [
                ...parserContext.parserState.functionLikeEntitiesByKey.values(),
            ],
            getMethodFeaturesExtractor(parserContext.directoryPath, parserContext.correlationId),
            MethodEntityViewFactory,
            (featuresValues: FeatureValue[][], featureNames: string[]) => featuresValues,
            EntityKind.method,
            logger,
            EntityKind.method
        );
    }

    function writeGqlTypes() {
        const gqlTypes = parserContext.parserState.gqlDeclarations.filter(instanceOfChecker(GqlObjectType));
        return writeElements(gqlTypes, "gql_types");
    }

    function writeSourceFileFeatures() {
        const {header, features} = getModuleFeatures([...parserContext.parserState.moduleEntitiesByName.values()]);
        return writeFeatures(features, header, "source_file");
    }

    async function writeEntityViewFeatures<TEntityView extends IEntityView>(
        entities: SnippetEntity[],
        featuresExtractor: FeaturesExtractor<TEntityView>,
        entityViewFactory: TEntityViewFactory<TEntityView>,
        entityFilteringFunction: FeaturesFilterFunction,
        entityViewKind: EntityKind,
        logger: LimLogger,
        featuresFileName?: string
    ) {
        let flattenedEntities = await executeWithLogAsync(logger, `${entityViewKind} features extraction`, () =>
            getFeatures(entities, featuresExtractor, entityViewFactory));

        flattenedEntities = entityFilteringFunction(flattenedEntities, featuresExtractor.featureNames);

        return await writeFeatures(flattenedEntities, featuresExtractor.featureNames, featuresFileName ?? `${entityViewKind}_snippets`);
    }

    function getFeatures<TEntityView extends IEntityView>(
        entities: SnippetEntity[],
        featuresExtractor: FeaturesExtractor<TEntityView>,
        entityViewFactory: TEntityViewFactory<TEntityView>
    ): FeatureValue[][] {
        return _.compact(entities.map(entity => {
            parserContext.throwIfCancelled();

            const entityContext = getEntityContext(entity);
            const entityView = entityViewFactory(entity, entityContext);
            return entityView ? featuresExtractor.getFeaturesValues(entityView, entityContext) : undefined;
        }));
    }

    function getModuleFeatures(entities: ModuleEntity[]): {header: string[], features: FeatureValue[][]} {
        const header = ["path", "RawImports"];
        const features = entities.map(entity => [
            entity.path,
            entity.importedEntities.map(importedEntity => importedEntity.moduleSpecifier)
        ]);
        return {header, features};
    }

    // This is a temporary solution to handle performance issues when loading these features further down the pipeline.
    // In this hack, we assume that the ONLY relevant api snippets, are those that were labeled as APIs. Once we add node API
    // prediction, this assumption will no longer be relevant and we will need to find another way to solve the performance
    // issues.
    function filterPredictedApiFeatures(
        featuresValues: FeatureValue[][],
        featureNames: string[]
    ): FeatureValue[][] {

        if (process.env.INCLUDE_ALL_SNIPPETS !== undefined) {
            return featuresValues;
        }

        const labelIndexes: number[] = [];
        const filteredFeatures: FeatureValue[][] = [];

        featureNames.forEach((featureName, index) => {
            if (featureName.startsWith("!")) {
                labelIndexes.push(index);
            }
        });

        featuresValues.forEach(entityFeatures => {
            if (labelIndexes.some(index => entityFeatures[index] === true)) {
                filteredFeatures.push(entityFeatures);
            }
        });

        logger.info(`${filteredFeatures.length}/${featuresValues.length} api entities were labeled true`);
        return filteredFeatures;
    }

    async function writeFeatures(
        featuresValues: FeatureValue[][],
        featureNames: string[],
        suffix: string
    ): Promise<string> {
        const writer = new FilesWriter(parserContext.outputDirectoryPath);
        const prefix = `${path.parse(parserContext.directoryPath).base}_${suffix}`;
        return await writer.writeFeatures(parserContext, featureNames, featuresValues, prefix);
    }

    async function writeElements<T>(
        elements: T[],
        suffix: string
    ): Promise<string> {
        const writer = new FilesWriter(parserContext.outputDirectoryPath);
        const prefix = `${path.parse(parserContext.directoryPath).base}_${suffix}`;
        return await writer.writeElements(parserContext, elements, prefix);
    }

    function getEntityContext(entity: SnippetEntity): FeaturesEntityContext {
        const classKey = entity.classKey;
        const hasClass = classKey && parserContext.parserState.classEntitiesByKey.has(classKey);
        const classEntity = hasClass ? parserContext.parserState.classEntitiesByKey.get(classKey) : undefined;
        const moduleEntity = parserContext.parserState.moduleEntitiesByName.get(entity.path);

        if (moduleEntity === undefined) {
            throw Error(`Entity ${entity.key.keyString()} is missing module entity`);
        }

        return {
            classEntity: classEntity,
            moduleEntity: moduleEntity
        };
    }
}
