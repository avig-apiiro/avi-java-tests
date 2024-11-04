import {ClassEntity} from "../../models/entities/ClassEntity";
import {ModuleEntity} from "../../models/entities/ModuleEntity";

export interface FeaturesEntityContext {
    classEntity: ClassEntity | undefined;
    moduleEntity: ModuleEntity
}
