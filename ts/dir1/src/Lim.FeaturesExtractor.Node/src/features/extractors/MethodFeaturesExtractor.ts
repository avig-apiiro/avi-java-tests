import {
    CommonFeaturesProvidersForMethods
} from "../providers/featuresProviders/commonFeaturesProviders/CommonFeaturesProviders";
import {FeaturesExtractor} from "./FeaturesExtractor";
import {MethodEntityViewFunctionLike} from "../../models/entityViews/MethodEntityViewFunctionLike";
import {MethodDeclarationFeaturesProviders} from "../providers/featuresProviders/methodFeaturesProviders/MethodDeclarationFeaturesProviders";

const MethodFeaturesProviders = [
    ...CommonFeaturesProvidersForMethods,
    ...MethodDeclarationFeaturesProviders
].map(provider => new provider());

export const getMethodFeaturesExtractor = (dirname: string, correlationId: string): FeaturesExtractor<MethodEntityViewFunctionLike> =>
    new FeaturesExtractor(dirname, correlationId, MethodFeaturesProviders);

