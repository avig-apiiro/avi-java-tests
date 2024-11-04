import ts from "typescript";
import {SnippetType} from "../../../../models/entities/SnippetEntity";
import {ApiEntityViewCallExpression} from "../../../../models/entityViews/ApiEntityViewCallExpression";
import {httpMethods} from "../../../../types/HttpMethods";
import {FeatureProviderInput} from "../../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureName, FeatureProvider, FeaturesNames, FeaturesProvider} from "../../ProviderBase";
import {isRouteLike} from "../../utils/apiUtils";
import {getCallExpressionFuncNames} from "../../utils/callExpressionDataExtractor";
import {capString} from "../../utils/featuresValuesTransformers";

type TInput = FeatureProviderInput<ApiEntityViewCallExpression>;

@FeatureEntityType(SnippetType.CallExpression)
class CallExpressionFeatureProvider extends FeatureProvider<ApiEntityViewCallExpression> {
}

@FeatureEntityType(SnippetType.CallExpression)
class CallExpressionFeaturesProvider extends FeaturesProvider<ApiEntityViewCallExpression> {
}

@FeaturesNames([
    "CallExpressionFullName",
    "CallExpressionFuncName",
])
class NamesProvider extends CallExpressionFeaturesProvider {
    getValues(input: TInput): string[] {
        const [callExpressionFuncName, callExpressionFullName] = getCallExpressionFuncNames(input.entityView.entity, input.logger);
        return [
            callExpressionFullName,
            callExpressionFuncName,
        ];
    }
}

@FeaturesNames([
    'CallExpressionStartsWithHttpMethod',
    'CallExpressionEndsWithHttpMethod'
])
class HttpNamesProvider extends CallExpressionFeaturesProvider {
    getValues(input: TInput): boolean[] {
        const lowercaseFuncName = input.entityView.entity.callExpressionFuncName.toLowerCase();
        return [
            httpMethods.some(httpMethod => lowercaseFuncName.startsWith(httpMethod)),
            httpMethods.some(httpMethod => lowercaseFuncName.endsWith(httpMethod))
        ];
    }
}

@FeatureName("CallExpressionTargetType")
class TargetTypeProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput) => capString(input.entityView.entity.callExpressionTargetType, "callExpressionTargetType", input.logger, input.entityView.entity.key);
}

@FeatureName("CallExpressionNumArgs")
class NumArgsProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): number => input.entityView.entity.callExpressionArguments.length;
}

@FeatureName("CallExpressionArgsTypescriptKind")
class ArgsTypescriptKindProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): string[] => input.entityView.entity.callExpressionArguments.map(argument => ts.SyntaxKind[argument.kind]);
}

@FeatureName("CallExpressionArgsValues")
class ArgsValuesProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): string[] => input.entityView.entity.callExpressionArguments.map(argument => capString(argument.literalValue, "argValue", input.logger, input.entityView.entity.key));
}

@FeatureName("InternalReferencedMethods")
class InternalReferencedMethodsProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): string[] => input.entityView.entity.InternalReferencedMethods;
}

@FeatureName("ExternalReferencedMethods")
class ExternalReferencedMethodsProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): string[] => input.entityView.entity.ExternalReferencedMethods;
}

@FeatureName("CallExpressionArgsTypes")
class ArgsTypesProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): string[] => input.entityView.entity.callExpressionArguments.map(argument => capString(argument.typeString, "argType", input.logger, input.entityView.entity.key));
}

@FeatureName("CallExpressionArgsCallabilities")
class ArgsCallabilitiesProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): number[] => input.entityView.entity.callExpressionArguments.map(argument => argument.callability);
}

@FeaturesNames([
    "CallExpressionIsFirstArgStringLiteral",
    "CallExpressionIsFirstArgStringLiteralRoute"
])
class IsFirstArgStringLiteralProvider extends CallExpressionFeaturesProvider {
    getValues = (input: TInput): boolean[] => {
        const firstArgStringLiteral = input.entityView.firstArgString;
        const firstArgStringLiteralPath = !!firstArgStringLiteral && isRouteLike(firstArgStringLiteral);
        return [!!firstArgStringLiteral, firstArgStringLiteralPath];
    };
}

@FeatureName("CallExpressionIsParenthesized")
class IsParenthesizedProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.callExpressionIsParenthesized;
}

@FeatureName("CallExpressionIsDecorator")
class IsDecoratorProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.callExpressionIsDecorator;
}

@FeatureName("CallExpressionIsMethodInvocation")
class IsMethodInvocationAccessProvider extends CallExpressionFeatureProvider {
    getValue = (input: TInput): boolean => input.entityView.entity.callExpressionIsPropertyAccess && input.entityView.entity.siblingsInfo != undefined;
}

@FeatureEntityType(SnippetType.CallExpression)
class MethodInvocationFeatureProvider extends FeatureProvider<ApiEntityViewCallExpression> {
    isRelevant(input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean {
        return input.entityView.entity.callExpressionIsPropertyAccess;
    };
}

@FeatureName("CallExpressionMethodOwnerText")
class MethodOwnerTextProvider extends MethodInvocationFeatureProvider {
    getValue = (input: TInput): string =>
        capString(input.entityView.entity.methodInvocationOwnerText, "methodInvocationOwnerText", input.logger, input.entityView.entity.key);
}

@FeatureName("CallExpressionMethodOwnerType")
class MethodOwnerTypeProvider extends MethodInvocationFeatureProvider {
    getValue = (input: TInput): string =>
        capString(input.entityView.entity.methodInvocationOwnerType, "methodInvocationOwnerType", input.logger, input.entityView.entity.key);
}

@FeatureName("CallExpressionSiblingHttpMethodsCount")
class SiblingsHttpMethodCountProvider extends MethodInvocationFeatureProvider {
    getValue = (input: TInput): number => input.entityView.entity.siblingsInfo.httpMethodsCount;

}

@FeatureName("CallExpressionSiblingAppFxMethodsCount")
class SiblingsAppFxCountProvider extends MethodInvocationFeatureProvider {
    getValue = (input: TInput): number => input.entityView.entity.siblingsInfo.appFrameworkMethodsCount;
}

@FeatureName("CallExpressionSiblingOtherMethodsCount")
class SiblingsOtherMethodCountProvider extends MethodInvocationFeatureProvider {
    getValue = (input: TInput): number => input.entityView.entity.siblingsInfo.otherMethodCount;
}

export const CallExpressionFeaturesProviders = [
    NamesProvider,
    TargetTypeProvider,
    IsMethodInvocationAccessProvider,
    MethodOwnerTextProvider,
    MethodOwnerTypeProvider,
    SiblingsHttpMethodCountProvider,
    SiblingsAppFxCountProvider,
    SiblingsOtherMethodCountProvider,
    NumArgsProvider,
    ArgsTypescriptKindProvider,
    ArgsValuesProvider,
    InternalReferencedMethodsProvider,
    ExternalReferencedMethodsProvider,
    ArgsTypesProvider,
    ArgsCallabilitiesProvider,
    IsFirstArgStringLiteralProvider,
    IsParenthesizedProvider,
    IsDecoratorProvider,
    HttpNamesProvider,
];
