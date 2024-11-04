import {FeaturesEntityContext} from "../../features/types/EntityContext";
import {CallExpressionEntity} from "../entities/CallLikeEntities";
import {ClassEntity} from "../entities/ClassEntity";
import {InterfaceEntity} from "../entities/InterfaceEntity";
import {FunctionLikeEntity} from "../entities/FunctionLikeEntity";
import {ModuleEntity} from "../entities/ModuleEntity";
import {SnippetEntity, SnippetType} from "../entities/SnippetEntity";
import {DataModelEntityViewInterface} from "./DataModelEntityViewInterface";
import {DataModelEntityViewJoi} from "./DataModelEntityViewJoi";
import {DataModelEntityViewMongoose} from "./DataModelEntityViewMongooseSchema";
import {DataModelEntityViewSequelizeDefine, DataModelEntityViewSequelizeInit} from "./DataModelEntityViewSequelize";
import {DataModelEntityViewTypeorm} from "./DataModelEntityViewTypeorm";
import {DataModelEntityViewConstructorFunction} from "./DataModelEntityViewConstructorFunction";
import {IDataModelEntityView} from "./IDataModelEntityView";
import {DataModelEntityViewClass} from "./DataModelEntityViewClass";

export function DataModelEntityViewFactory(entity: SnippetEntity, entityContext: FeaturesEntityContext): IDataModelEntityView | undefined {
    switch (entity.snippetType) {

        case SnippetType.InterfaceDeclaration:
            return new DataModelEntityViewInterface(entity as InterfaceEntity);

        case SnippetType.CallExpression:
            const module = entityContext.moduleEntity;
            const callExpressionEntity = entity as CallExpressionEntity;

            for (const [entityViewDetector, entityViewClass] of callExpressionEntityViewCreators) {
                if (entityViewDetector(callExpressionEntity, module)) {
                    return new entityViewClass(callExpressionEntity);
                }
            }
            break;

        case SnippetType.ClassDeclaration:
            const classEntity = entity as ClassEntity;

            if (DataModelEntityViewTypeorm.isTypeorm(classEntity, entityContext.moduleEntity)) {
                return new DataModelEntityViewTypeorm(classEntity);
            }

            if (DataModelEntityViewClass.isClassDataModel(classEntity)) {
                return new DataModelEntityViewClass(classEntity);
            }
            break;

        case SnippetType.FunctionDeclaration:
            const functionEntity = entity as FunctionLikeEntity;
            if (DataModelEntityViewConstructorFunction.isConstructorFunction(functionEntity)) {
                return new DataModelEntityViewConstructorFunction(functionEntity);
            }
            break;

        default:
            return undefined;
    }
}

const callExpressionEntityViewCreators: [(entity: CallExpressionEntity, module: ModuleEntity) => boolean, { new(entity: CallExpressionEntity): IDataModelEntityView }][] = [
    [DataModelEntityViewSequelizeDefine.isSequelizeDefine, DataModelEntityViewSequelizeDefine],
    [DataModelEntityViewSequelizeInit.isSequelizeInit, DataModelEntityViewSequelizeInit],
    [DataModelEntityViewMongoose.isMongooseModel, DataModelEntityViewMongoose],
    [DataModelEntityViewJoi.isJoi, DataModelEntityViewJoi]
];
