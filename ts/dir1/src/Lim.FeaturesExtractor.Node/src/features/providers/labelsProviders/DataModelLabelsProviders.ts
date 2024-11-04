import {SnippetType} from "../../../models/entities/SnippetEntity";
import {DataModelEntityViewJoi} from "../../../models/entityViews/DataModelEntityViewJoi";
import {DataModelEntityViewMongoose} from "../../../models/entityViews/DataModelEntityViewMongooseSchema";
import {
    DataModelEntityViewSequelizeDefine,
    DataModelEntityViewSequelizeInit
} from "../../../models/entityViews/DataModelEntityViewSequelize";
import {DataModelEntityViewTypeorm} from "../../../models/entityViews/DataModelEntityViewTypeorm";
import {IDataModelEntityView} from "../../../models/entityViews/IDataModelEntityView";
import {FeatureProviderInput} from "../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureProvider, Label} from "../ProviderBase";

const DataModelLabel = (name) => Label('DataModelLabel', name);

@FeatureEntityType(SnippetType.CallExpression, [DataModelEntityViewSequelizeInit, DataModelEntityViewSequelizeDefine])
@DataModelLabel("Sequelize")
class SequelizeProvider extends FeatureProvider<IDataModelEntityView> {
    getValue = (input: FeatureProviderInput<IDataModelEntityView>): boolean => true;
}

@FeatureEntityType(SnippetType.ClassDeclaration, DataModelEntityViewTypeorm)
@DataModelLabel("Typeorm")
class TypeormProvider extends FeatureProvider<DataModelEntityViewTypeorm> {
    getValue = (input: FeatureProviderInput<DataModelEntityViewTypeorm>): boolean => true;
}

@FeatureEntityType(SnippetType.CallExpression, DataModelEntityViewMongoose)
@DataModelLabel("Mongoose")
class MongooseProvider extends FeatureProvider<DataModelEntityViewMongoose> {
    getValue = (input: FeatureProviderInput<DataModelEntityViewMongoose>): boolean => true;
}

@FeatureEntityType(SnippetType.CallExpression, DataModelEntityViewJoi)
@DataModelLabel("Joi")
class JoiProvider extends FeatureProvider<DataModelEntityViewMongoose> {
    getValue = (input: FeatureProviderInput<DataModelEntityViewMongoose>): boolean => true;
}

export const DataModelLabelsProviders = [
    SequelizeProvider,
    TypeormProvider,
    MongooseProvider,
    JoiProvider
];
