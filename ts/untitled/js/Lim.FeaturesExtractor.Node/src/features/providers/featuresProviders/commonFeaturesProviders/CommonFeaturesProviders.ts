import {isDevEnv} from "../../../../config";
import {baseClonedPath} from "../../../../internals/consts";
import {SnippetType} from "../../../../models/entities/SnippetEntity";
import {IEntityView} from "../../../../models/entityViews/IEntityView";
import {FeatureProviderInput} from "../../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureName, FeatureProvider, FeaturesNames, FeaturesProvider} from "../../ProviderBase";

@FeatureEntityType()
class CommonFeaturesProvider extends FeatureProvider<IEntityView> {
}

@FeatureName("UID")
class UidProvider extends CommonFeaturesProvider {
    getValue = (input: FeatureProviderInput<IEntityView>): string => input.entityView.entity.getUid();
}

@FeatureName("MethodUniqueName")
class MethodUniqueNameProvider extends CommonFeaturesProvider {
    getValue = (input: FeatureProviderInput<IEntityView>): string => input.entityView.entity.getUid();
}

@FeatureName("SnippetType")
class SnippetTypeProvider extends CommonFeaturesProvider {
    getValue = (input: FeatureProviderInput<IEntityView>): string => SnippetType[input.entityView.getSnippetType()];
}

@FeatureName("Path")
class PathProvider extends CommonFeaturesProvider {
    getValue = (input: FeatureProviderInput<IEntityView>): string => input.entityView.entity.path;
}
@FeatureName("LineNumber")
class LineNumberProvider extends CommonFeaturesProvider {
    getValue = (input: FeatureProviderInput<IEntityView>): number => input.entityView.entity.line;
}

@FeatureName("EndsLineInFile")
class EndLineNumberProvider extends CommonFeaturesProvider {
    getValue = (input: FeatureProviderInput<IEntityView>): number => input.entityView.entity.endLine;
}

@FeaturesNames(["Link", "RepositoryName"])
class GithubProvider extends FeaturesProvider<IEntityView> {
    getValues(input: FeatureProviderInput<IEntityView>): string[] {
        if (isDevEnv && input.dirname.startsWith(baseClonedPath)) {
            const [author, repo] = input.dirname.split("/")[1].split("__");
            const path = input.entityView.entity.path;
            const line = input.entityView.entity.key.start.line + 1;

            return [`https://github.com/${author}/${repo}/blob/master/${path}#L${line}`, `${author}/${repo}`];
        }

        return ["", ""];
    }
}

@FeatureName("ExternalImportedModules")
class ExternalImportedModulesProvider extends CommonFeaturesProvider {
    getValue = (input: FeatureProviderInput<IEntityView>): string[] => input.entityContext.moduleEntity.externalImportedModuleNames;
}

@FeatureName("ExternalImportedModulesLen")
class ExternalImportedModulesLenProvider extends CommonFeaturesProvider {
    getValue = (input: FeatureProviderInput<IEntityView>): number => input.entityContext.moduleEntity.externalImportedModuleNames.length;
}

export const CommonFeaturesProvidersForMethods = [
    MethodUniqueNameProvider,
    PathProvider,
    LineNumberProvider,
    EndLineNumberProvider,
    GithubProvider,
    SnippetTypeProvider,
    ExternalImportedModulesProvider,
    ExternalImportedModulesLenProvider
];


export const CommonFeaturesProviders = [
    UidProvider,
    PathProvider,
    LineNumberProvider,
    EndLineNumberProvider,
    GithubProvider,
    SnippetTypeProvider,
    ExternalImportedModulesProvider,
    ExternalImportedModulesLenProvider
];
