import {InterfaceEntity} from "../entities/InterfaceEntity";
import {EntityViewBase} from "./EntityViewBase";
import {IDataModelEntityView} from "./IDataModelEntityView";

export class DataModelEntityViewInterface extends EntityViewBase<InterfaceEntity> implements IDataModelEntityView {
    getDataModelMethodsCount(): number {
        return this.entity.methodCount;
    }

    getDataModelName(): string {
        return this.entity.name;
    }

    getDataModelProperties(): Map<string, string> {
        return this.entity.propertyNameToType;
    }

    isConfirmedDataModel = false;
}
