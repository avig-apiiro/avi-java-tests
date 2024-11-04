import {IApiEntityView} from "../../../../models/entityViews/IApiEntityView";
import {FeatureProviderInput} from "../../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureName, FeatureProvider} from "../../ProviderBase";
import {isRouteLike} from "../../utils/apiUtils";

const routeParamsRegex = new RegExp('\\/+[:|{}](?<param>[^?|\\/|$|}]+)', 'g');

@FeatureName("DisplayString")
@FeatureEntityType()
export class DisplayStringProvider extends FeatureProvider<IApiEntityView> {
    getValue = (input: FeatureProviderInput<IApiEntityView>): string => {
        return input.entityView.getDisplayString() || '';
    };
}

@FeatureName("SuspectedApiMethod")
@FeatureEntityType()
export class ApiMethodProvider extends FeatureProvider<IApiEntityView> {
    getValue = (input: FeatureProviderInput<IApiEntityView>): string => {
        const method = input.entityView.getSuspectedApiMethod();
        return method ? method.toUpperCase() : '';
    };
}

@FeatureName("SuspectedApiRoute")
@FeatureEntityType()
export class ApiRouteProvider extends FeatureProvider<IApiEntityView> {
    getValue = (input: FeatureProviderInput<IApiEntityView>): string => {
        const routeCandidate = input.entityView.getSuspectedApiRoute();
        return !!routeCandidate && isRouteLike(routeCandidate) ? routeCandidate : '';
    };
}

@FeatureName("SuspectedApiRouteParams")
@FeatureEntityType()
export class ApiRouteParamsProvider extends FeatureProvider<IApiEntityView> {
    getValue = (input: FeatureProviderInput<IApiEntityView>): string[] => {
        const routeCandidate = input.entityView.getSuspectedApiRoute();
        const result: string[] = [];

        if (!!routeCandidate && isRouteLike(routeCandidate)) {
            let match;
            while ((match = routeParamsRegex.exec(routeCandidate)) !== null) {
                result.push(match.groups.param);
            }
        }

        return result;
    };
}

export const ApiHintsFeaturesProviders = [
    ApiMethodProvider,
    ApiRouteProvider,
    ApiRouteParamsProvider,
    DisplayStringProvider
];
