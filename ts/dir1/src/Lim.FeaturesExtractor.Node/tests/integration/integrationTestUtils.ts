import _ from "lodash";
import {FeaturesExtractor} from "../../src/features/extractors/FeaturesExtractor";
import {FeatureValue} from "../../src/features/providers/ProviderBase";
import {scrapeFilesAsync} from "../../src/internals/FilesScraper";
import {LimLogger} from "../../src/internals/Logger";
import {ensureWorkingDirectories} from "../../src/internals/setup";
import {CallExpressionEntity} from "../../src/models/entities/CallLikeEntities";
import {ClassEntity} from "../../src/models/entities/ClassEntity";
import {InterfaceEntity} from "../../src/models/entities/InterfaceEntity";
import {ModuleEntity} from "../../src/models/entities/ModuleEntity";
import {SnippetEntity, SnippetType} from "../../src/models/entities/SnippetEntity";
import {TEntityViewFactory} from "../../src/models/entityViews/EntityViewFactory";
import {IEntityView} from "../../src/models/entityViews/IEntityView";
import {executeParser} from "../../src/parser/Parser";
import {Context} from "../../src/types/Context";
import {getCompilerOptions} from "../../src/workers/FolderWorker";

export function getTestContext(relativeProjectPath: string): Context {
    return new Context("TEST", `tests/projects/${relativeProjectPath}`);
}

export async function runParserFlow(context: Context) {
    const fileNames: string[] = await scrapeFilesAsync(context);
    ensureWorkingDirectories();

    const compilerOptions = await getCompilerOptions(context.directoryPath, new LimLogger(""));
    await executeParser(context, fileNames, compilerOptions);
}

export function findEntity<TEntity extends SnippetEntity>(
    entities: Iterable<SnippetEntity>,
    snippetType: SnippetType,
    ...predicates: ((entity: TEntity) => boolean)[]
): TEntity | undefined {
    for (const entity of entities) {
        if (entity.snippetType !== snippetType) {
            continue;
        }

        if (predicates.every(predicate => predicate(entity as TEntity))) {
            return entity as TEntity;
        }
    }

    return undefined;
}

export function entityPathPredicate(path: string) {
    return (entity: SnippetEntity) => entity.path === path;
}

export function findClassByName(className: string, context: Context): ClassEntity | undefined {
    for (const classEntity of (context.parserState.classEntitiesByKey.values())) {
        if (classEntity.className === className) {
            return classEntity;
        }
    }
}

export function findModuleByName(moduleName: string, context: Context): ModuleEntity | undefined {
    if (context.parserState.moduleEntitiesByName.has(moduleName)) {
        return context.parserState.moduleEntitiesByName.get(moduleName);
    }
}

export function findInterfaceByName(interfaceName: string, context: Context): InterfaceEntity | undefined {
    for (const interfaceEntity of (context.parserState.interfaceEntitiesByKey.values())) {
        if (interfaceEntity.name === interfaceName) {
            return interfaceEntity;
        }
    }
}

export function findCallExpressionByTextAndPath(callExpressionText: string, path: string, context: Context, ...predicates: ((entity: CallExpressionEntity) => boolean)[]): CallExpressionEntity | undefined {
    return findEntity<CallExpressionEntity>(
        context.parserState.callExpressionEntitiesByKey.values(),
        SnippetType.CallExpression,
        entityPathPredicate(path),
        entity => entity.callExpressionFullText === callExpressionText,
        ...predicates);
}

export function createEntityView<TEntityView extends IEntityView>(entity: SnippetEntity, context: Context, viewFactory: TEntityViewFactory<TEntityView>) {
    const entityContext = getEntityContext(entity, context);
    return viewFactory(entity, entityContext);
}

export function getFeaturesMap<TEntityView extends IEntityView>(entity: SnippetEntity, viewFactory: TEntityViewFactory<TEntityView>, featuresExtractor: FeaturesExtractor<TEntityView>, context: Context): Map<string, FeatureValue> {
    const entityContext = getEntityContext(entity, context);
    const entityView = viewFactory(entity, entityContext);

    if (entityView == undefined) {
        return new Map();
    }

    const names = featuresExtractor.featureNames;
    const values = featuresExtractor.getFeaturesValues(entityView, entityContext);

    return new Map(_.zip(names, values) as [string, FeatureValue][]);
}

function getEntityContext(entity: SnippetEntity, context: Context) {
    const moduleEntity = context?.parserState.moduleEntitiesByName.get(entity.path);
    return {
        classEntity: context?.parserState.classEntitiesByKey.get(entity.classKey),
        moduleEntity: moduleEntity ?? new ModuleEntity("")
    };
}

