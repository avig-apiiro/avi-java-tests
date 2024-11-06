import {IApiEntityView} from "../../../../models/entityViews/IApiEntityView";
import {FeatureProviderInput} from "../../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureName, FeatureProvider} from "../../ProviderBase";

const httpClientModules = new Set([
    "axios",
    "request",
    "superagent",
    "@angular/common/http"
]);

const clientFrameworksModulePrefix = [
    "react",
    "@angular"
];

@FeatureName("HasHttpClientModulesImported")
@FeatureEntityType()
export class HasHttpClientModulesImportedProvider extends FeatureProvider<IApiEntityView> {
    getValue = (input: FeatureProviderInput<IApiEntityView>): boolean =>
        input.entityContext.moduleEntity.externalImportedModuleNames.some(moduleName => httpClientModules.has(moduleName));
}

@FeatureName("HasClientFrameworkModulesImported")
@FeatureEntityType()
export class HasClientFrameworkModulesImportedProvider extends FeatureProvider<IApiEntityView> {
    getValue = (input: FeatureProviderInput<IApiEntityView>): boolean => {
        return input.entityContext.moduleEntity.externalImportedModuleNames.some(module =>
            clientFrameworksModulePrefix.some(prefix => module.startsWith(prefix))
        );
    };
}

export const CommonApiFeaturesProvider = [
    HasHttpClientModulesImportedProvider,
    HasClientFrameworkModulesImportedProvider,
];
