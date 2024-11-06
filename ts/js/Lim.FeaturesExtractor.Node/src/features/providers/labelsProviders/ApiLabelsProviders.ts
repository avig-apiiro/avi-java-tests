import _ from "lodash";
import ts from "typescript";
import {LimLogger} from "../../../internals/Logger";
import {CallExpressionEntity} from "../../../models/entities/CallLikeEntities";
import {ModuleEntity} from "../../../models/entities/ModuleEntity";
import {SnippetType} from "../../../models/entities/SnippetEntity";
import {ApiEntityViewCallExpression} from "../../../models/entityViews/ApiEntityViewCallExpression";
import {ApiEntityVieweHapi} from "../../../models/entityViews/ApiEntityVieweHapi";
import {isTypeCallable} from "../../../parser/visitors/utils/nodeCommonUtils";
import {httpMethods} from "../../../types/HttpMethods";
import {FeatureProviderInput} from "../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureProvider, Label} from "../ProviderBase";
import {getCallExpressionFuncNames} from "../utils/callExpressionDataExtractor";
import {ApiEntityViewPapaya} from "../../../models/entityViews/ApiEntityViewPapaya";

const ApiLabel = (name) => Label("ApiLabel", name);
const FalsePositiveIndicatingImport = ["msw", "miragejs"]

@FeatureEntityType(SnippetType.CallExpression, ApiEntityViewCallExpression)
class CallExpressionApiLabelProvider extends FeatureProvider<ApiEntityViewCallExpression> {
}

@ApiLabel("Express")
class ExpressProvider extends CallExpressionApiLabelProvider {
    getValue = (input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean =>
        getExpressLabelHelper(input.entityView.entity, input.entityContext.moduleEntity, input.logger, false);
}

@ApiLabel("Express.IO")
class ExpressIoProvider extends CallExpressionApiLabelProvider {
    getValue = (input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean =>
        getExpressLabelHelper(input.entityView.entity, input.entityContext.moduleEntity, input.logger, true);
}

@ApiLabel("Koa")
class KoaProvider extends CallExpressionApiLabelProvider {
    getValue = (input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean => {
        const [callExpressionFuncName] = getCallExpressionFuncNames(input.entityView.entity, input.logger);
        const hasHttpMethodName = () => httpMethods.includes(callExpressionFuncName.toLowerCase());
        const importsKoa = () =>
            ['koa', 'koa-router', '@koa/router'].some(moduleName => input.entityContext.moduleEntity.hasImport(moduleName));

        return hasHttpMethodName() && importsKoa() && hasHandlerLikeArgs(input, 1, 2);
    };
}

@ApiLabel("ExpressStyleRouteDefinition")
class ExpressStyleRouteDefinitionProvider extends CallExpressionApiLabelProvider {
    getValue = (input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean => {
        const hasSuspectedHttpMethod = () => !!input.entityView.getSuspectedApiMethod();
        const hasSuspectedRoute = () => !!input.entityView.getSuspectedApiRoute();
        const hasRootRoute = !_.isEmpty(input.entityView.entity.rootRoutePath);
        if (input.entityContext.moduleEntity.importedEntities.some(importEntity => FalsePositiveIndicatingImport.includes(importEntity.moduleSpecifier)))
        {
            return false;
        }
        return (
            hasSuspectedHttpMethod() &&
            hasSuspectedRoute() &&
            hasHandlerLikeArgs(input, 2, 3, !hasRootRoute)
        );
    };
}

function isDecoratorDefinedApi(input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean {
    const [callExpressionFuncName] = getCallExpressionFuncNames(input.entityView.entity, input.logger);

    const hasHttpMethodName = () => httpMethods.includes(callExpressionFuncName.toLowerCase());
    const isDecorator = () => input.entityView.entity.callExpressionIsDecorator;
    const hasHttpMethodArgTypes = () => {
        const args = input.entityView.entity.callExpressionArguments;
        return _.isEmpty(args) || args[0].kind === ts.SyntaxKind.StringLiteral;
    };

    return hasHttpMethodName() && isDecorator() && hasHttpMethodArgTypes();
}

@ApiLabel("RoutingController")
class RoutingControllerProvider extends CallExpressionApiLabelProvider {
    getValue(input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean {
        const importsRoutingController = () => input.entityContext.moduleEntity.hasImport('routing-controllers');
        return importsRoutingController() && isDecoratorDefinedApi(input);
    }
}

function containedInControllerClass(input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean {
    const decorators = input.entityContext.classEntity?.decorators;
    if (decorators === undefined) {
        return false;
    }
    return decorators.filter(decorator => decorator.decoratorName === "Controller").length > 0;
}

@ApiLabel("NestJS")
class NestJsProvider extends CallExpressionApiLabelProvider {
    getValue(input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean {
        const importsNestJs = () =>
            input.entityContext.moduleEntity.importedEntities.filter(importedEntity => importedEntity.moduleSpecifier.startsWith("@nestjs")).length > 0;
        return importsNestJs() && containedInControllerClass(input) && isDecoratorDefinedApi(input);
    }
}

@FeatureEntityType(SnippetType.CallExpression, ApiEntityViewPapaya)
@ApiLabel("Papaya")
class PapayaApiProvider extends FeatureProvider<ApiEntityViewPapaya> {
    getValue  = (input: FeatureProviderInput<ApiEntityViewPapaya>): boolean => true;
}

@FeatureEntityType(SnippetType.CallExpression, ApiEntityVieweHapi)
@ApiLabel("HapiRoute")
class HapiRouteProvider extends FeatureProvider<ApiEntityVieweHapi> {
    getValue = (input: FeatureProviderInput<ApiEntityVieweHapi>): boolean => true;
}

@ApiLabel("ServerJS")
class ServerJSProvider extends CallExpressionApiLabelProvider {
    getValue = (input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean =>
        getServerJSLabelHelper(input.entityView.entity, input.entityContext.moduleEntity, input.logger);
}

@ApiLabel("SFRA")
class SFRAProvider extends CallExpressionApiLabelProvider {
    getValue = (input: FeatureProviderInput<ApiEntityViewCallExpression>): boolean =>
        getSFRALabelHelper(input.entityView.entity, input.entityContext.moduleEntity, input.logger);
}

function getExpressLabelHelper(entity: CallExpressionEntity, moduleEntity: ModuleEntity, logger: LimLogger, isExpressIO: boolean): boolean {
    const [callExpressionFuncName, callExpressionFullName] = getCallExpressionFuncNames(entity, logger);

    const importsExpress = () => moduleEntity.hasImport(`express${isExpressIO ? ".io" : ""}`);
    const hasHttpMethodName = () => httpMethods.includes(callExpressionFuncName);
    const hasExpressKeywords = () => ["all", "del"].includes(callExpressionFuncName);
    const funcNameDifferentFullName = () => callExpressionFuncName != callExpressionFullName;
    if (moduleEntity.importedEntities.some(importEntity => FalsePositiveIndicatingImport.includes(importEntity.moduleSpecifier)))
    {
        return false;
    }
    return (importsExpress()
        && (
            (hasHttpMethodName() && entity.hasMinimumArgumentsCount(2))
            || (hasHttpMethodName() && !_.isEmpty(entity.rootRoutePath) && entity.hasMinimumArgumentsCount(1))
            || (hasExpressKeywords() && entity.hasMinimumArgumentsCount(2))
        )
        && funcNameDifferentFullName()
        && !entity.shouldRemoveApi);
}

function getServerJSLabelHelper(entity: CallExpressionEntity, moduleEntity: ModuleEntity, logger: LimLogger) {
    const [, callExpressionFullName] = getCallExpressionFuncNames(entity, logger);

    const importsServer = () => moduleEntity.hasImport('server') ||
        moduleEntity.hasImport('server/router');
    const hasHttpMethodName = () => ['get', 'head', 'post', 'put', 'del'].includes(callExpressionFullName);

    return importsServer() && hasHttpMethodName() && entity.hasMinimumArgumentsCount(2);
}

function getSFRALabelHelper(entity: CallExpressionEntity, moduleEntity: ModuleEntity, logger: LimLogger): boolean {
    const [callExpressionFuncName, callExpressionFullName] = getCallExpressionFuncNames(entity, logger);

    const importsSFRA = () => moduleEntity.hasImport('server');
    const hasSFRAMethodName = () => ['get', 'post'].includes(callExpressionFuncName);
    const isPropertyAccess = () => entity.callExpressionIsPropertyAccess;

    return importsSFRA() && isPropertyAccess() && hasSFRAMethodName() && entity.hasMinimumArgumentsCount(2);
}

function hasHandlerLikeArgs(input: FeatureProviderInput<ApiEntityViewCallExpression>, minArity: number, maxArity: number, expectRouteFirstArgument: boolean = true): boolean {
    const potentialHandlerArguments = input.entityView.getArgumentTypes().slice(expectRouteFirstArgument ? 1 : 0);

    return !_.isEmpty(potentialHandlerArguments) &&
        potentialHandlerArguments.every(argType => isTypeCallable(argType, minArity, maxArity, false));
}

export const ApiLabelsProviders = [
    ExpressProvider,
    ExpressIoProvider,
    KoaProvider,
    ExpressStyleRouteDefinitionProvider,
    RoutingControllerProvider,
    NestJsProvider,
    PapayaApiProvider,
    HapiRouteProvider,
    ServerJSProvider,
    SFRAProvider
];
