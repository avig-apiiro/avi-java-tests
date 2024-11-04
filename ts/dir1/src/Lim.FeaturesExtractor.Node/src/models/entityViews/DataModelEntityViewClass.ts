import {IDataModelEntityView} from "./IDataModelEntityView";
import {EntityViewBase} from "./EntityViewBase";
import {ClassEntity} from "../entities/ClassEntity";

export class DataModelEntityViewClass extends EntityViewBase<ClassEntity> implements IDataModelEntityView {
    static isClassDataModel(entity: ClassEntity): boolean {
        return (
            !!entity.className &&
            entity.propertyNameToType.size > 0
        );
    }

    getDataModelName(): string {
        return this.entity.className;
    }

    getDataModelProperties(): Map<string, string> {
        return this.entity.propertyNameToType;
    }

    getDataModelMethodsCount(): number {
        return this.entity.methodCount;
    }

    isConfirmedDataModel = false;
}
