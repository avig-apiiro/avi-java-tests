import {IDataModelEntityView} from "../../models/entityViews/IDataModelEntityView";
import {CommonFeaturesProviders} from "../providers/featuresProviders/commonFeaturesProviders/CommonFeaturesProviders";
import {CommonDataModelFeaturesProviders} from "../providers/featuresProviders/dataModelFeaturesProviders/CommonDataModelFeaturesProviders";
import {DataModelLabelsProviders} from "../providers/labelsProviders/DataModelLabelsProviders";
import {FeaturesExtractor} from "./FeaturesExtractor";

const DataModelFeaturesProviders = [
    ...CommonFeaturesProviders,
    ...CommonDataModelFeaturesProviders,
    ...DataModelLabelsProviders
].map(provider => new provider());

export const getDataModelFeaturesExtractor = (dirname: string, correlationId: string): FeaturesExtractor<IDataModelEntityView> =>
    new FeaturesExtractor(dirname, correlationId, DataModelFeaturesProviders);

