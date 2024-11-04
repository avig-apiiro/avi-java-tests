import {IDataModelEntityView} from "../../../../models/entityViews/IDataModelEntityView";
import {FeatureProviderInput} from "../../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureName, FeatureProvider, MapFeature} from "../../ProviderBase";
import {mapToMapFeature} from "../../utils/featuresValuesTransformers";

@FeatureName("DataModelName")
@FeatureEntityType()
export class NameProvider extends FeatureProvider<IDataModelEntityView> {
    getValue = (input: FeatureProviderInput<IDataModelEntityView>): string =>
        input.entityView.getDataModelName();
}

@FeatureName("DataModelMethodCount")
@FeatureEntityType()
export class MethodCountProvider extends FeatureProvider<IDataModelEntityView> {
    getValue = (input: FeatureProviderInput<IDataModelEntityView>): number =>
        input.entityView.getDataModelMethodsCount();
}

@FeatureName("DataModelProperties")
@FeatureEntityType()
export class PropertiesProvider extends FeatureProvider<IDataModelEntityView> {
    getValue = (input: FeatureProviderInput<IDataModelEntityView>): MapFeature =>
        mapToMapFeature(input.entityView.getDataModelProperties()) ?? {};
}

@FeatureName("IsConfirmedDataModel")
@FeatureEntityType()
export class IsConfirmedProvider extends FeatureProvider<IDataModelEntityView> {
    getValue = (input: FeatureProviderInput<IDataModelEntityView>): boolean =>
        input.entityView.isConfirmedDataModel ?? true;
}

export const CommonDataModelFeaturesProviders = [
    NameProvider,
    MethodCountProvider,
    PropertiesProvider,
    IsConfirmedProvider
];
