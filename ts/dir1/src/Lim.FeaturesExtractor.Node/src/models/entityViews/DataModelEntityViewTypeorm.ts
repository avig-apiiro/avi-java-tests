import {ClassEntity} from "../entities/ClassEntity";
import {ModuleEntity} from "../entities/ModuleEntity";
import {EntityViewBase} from "./EntityViewBase";
import {IDataModelEntityView} from "./IDataModelEntityView";

export class DataModelEntityViewTypeorm extends EntityViewBase<ClassEntity> implements IDataModelEntityView {
    static isTypeorm(entity: ClassEntity, module: ModuleEntity): boolean {
        const entityClass = () => entity.decorators.some(decorator => decorator.decoratorName === "Entity");
        const typeormImport = () => module.hasImport("typeorm");

        return entityClass() && typeormImport();
    }

    getDataModelMethodsCount(): number {
        return 0;
    }

    getDataModelName(): string {
        return this.entity.className;
    }

    getDataModelProperties(): Map<string, string> {
        return this.entity.propertyNameToType;
    }
}
