import {SnippetType} from "../../../../models/entities/SnippetEntity";
import {FeatureProviderInput} from "../../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureName, FeatureProvider, MapFeature} from "../../ProviderBase";
import {MethodEntityViewFunctionLike} from "../../../../models/entityViews/MethodEntityViewFunctionLike";
import {mapToMapFeature} from "../../utils/featuresValuesTransformers";

type TInput = FeatureProviderInput<MethodEntityViewFunctionLike>;

@FeatureEntityType(SnippetType.FunctionDeclaration)
class FunctionLikeFeatureProvider extends FeatureProvider<MethodEntityViewFunctionLike> {
}

@FeatureName("FunctionName")
class NameProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): string => input.entityView.entity.functionName;
}

@FeatureName("IsRealName")
class IsRealNameProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.isRealName;
}

@FeatureName("Parameters")
class ParametersProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): MapFeature => mapToMapFeature(input.entityView.entity.getParameters());
}

@FeatureName("InternalMethodCalls")
class InternalMethodCallsProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): string[] => input.entityView.entity.internalMethodCalls;
}

@FeatureName("ExternalMethodCalls")
class ExternalMethodCallsProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): string[] => input.entityView.entity.externalMethodCalls;
}

export const MethodDeclarationFeaturesProviders = [
    NameProvider,
    IsRealNameProvider,
    InternalMethodCallsProvider,
    ExternalMethodCallsProvider,
    ParametersProvider
];
