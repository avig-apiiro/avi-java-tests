import {IApiEntityView} from "../../models/entityViews/IApiEntityView";
import {ApiHintsFeaturesProviders} from "../providers/featuresProviders/apiFeaturesProviders/ApiHintsFeaturesProviders";
import {CallExpressionFeaturesProviders} from "../providers/featuresProviders/apiFeaturesProviders/CallExpressionFeaturesProviders";
import {CommonApiFeaturesProvider} from "../providers/featuresProviders/apiFeaturesProviders/CommonApiFeaturesProviders";
import {FunctionLikeFeaturesProviders} from "../providers/featuresProviders/apiFeaturesProviders/FunctionLikeFeaturesProviders";
import {CommonClassFeaturesProviders} from "../providers/featuresProviders/commonFeaturesProviders/CommonClassFeaturesProviders";
import {CommonFeaturesProviders} from "../providers/featuresProviders/commonFeaturesProviders/CommonFeaturesProviders";
import {ApiLabelsProviders} from "../providers/labelsProviders/ApiLabelsProviders";
import {TestLabelsProviders} from "../providers/labelsProviders/TestLabelsProviders";
import {FeaturesProvider} from "../providers/ProviderBase";
import {FeaturesExtractor} from "./FeaturesExtractor";

const ApiFeaturesProviders: FeaturesProvider<IApiEntityView>[] = [
    ...CommonFeaturesProviders,
    ...CommonApiFeaturesProvider,
    ...CommonClassFeaturesProviders,
    ...CallExpressionFeaturesProviders,

    // Disabled Wix specific features to ease memory issues cause by https://github.com/apiiro/lim/issues/4949
    // ...FunctionLikeFeaturesProviders,

    ...ApiHintsFeaturesProviders,
    ...ApiLabelsProviders,
    ...TestLabelsProviders,
].map(provider => new provider());

export const getApiFeaturesExtractor = (dirname: string, correlationId: string): FeaturesExtractor<IApiEntityView> =>
    new FeaturesExtractor(dirname, correlationId, ApiFeaturesProviders);
