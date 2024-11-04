import {FunctionType} from "../../../../models/entities/FunctionLikeEntity";
import {SnippetType} from "../../../../models/entities/SnippetEntity";
import {ApiEntityViewFunctionLike} from "../../../../models/entityViews/ApiEntityViewFunctionLike";
import {FeatureProviderInput} from "../../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureName, FeatureProvider, MapFeature} from "../../ProviderBase";
import {mapToMapFeature} from "../../utils/featuresValuesTransformers";

type TInput = FeatureProviderInput<ApiEntityViewFunctionLike>;

@FeatureEntityType(SnippetType.FunctionDeclaration)
class FunctionLikeFeatureProvider extends FeatureProvider<ApiEntityViewFunctionLike> {
}

@FeatureName("FunctionType")
class TypeProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): string => FunctionType[input.entityView.entity.functionType];
}

@FeatureName("TypescriptKind")
class TypescriptKingProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): string => input.entityView.entity.getTypeString();
}

@FeatureName("FunctionName")
class NameProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): string => input.entityView.entity.functionName;
}

@FeatureName("BodyLength")
class LengthProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): number => input.entityView.entity.bodyLength;
}

@FeatureName("ReturnType")
class ReturnTypeProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): string => input.entityView.entity.returnType;
}

@FeatureName("Parameters")
class ParametersProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): MapFeature => mapToMapFeature(input.entityView.entity.getParameters());
}

@FeatureName("IsSetter")
class IsSetterProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.isSetter;
}

@FeatureName("IsGetter")
class IsGetterProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.isGetter;
}

@FeatureName("IsConstructor")
class IsConstructorProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.isConstructor;
}

@FeatureName("HasDoc")
class HasDocProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.hasDoc;
}

@FeatureName("IsPrivate")
class IsPrivateProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.isPrivate;
}

@FeatureName("IsAbstract")
class IsAbstractProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.isAbstract;
}

@FeatureName("ContainsAuthentication")
class ContainsAuthenticationProvider extends FunctionLikeFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.containsAuthentication;
}

export const FunctionLikeFeaturesProviders = [
    TypeProvider,
    TypescriptKingProvider,
    NameProvider,
    LengthProvider,
    ReturnTypeProvider,
    ParametersProvider,
    IsSetterProvider,
    IsGetterProvider,
    IsConstructorProvider,
    HasDocProvider,
    IsPrivateProvider,
    IsAbstractProvider,
    ContainsAuthenticationProvider
];
