import _ from "lodash";
import {ClassEntity} from "../../../../models/entities/ClassEntity";
import {IApiEntityView} from "../../../../models/entityViews/IApiEntityView";
import {FeatureProviderInput} from "../../../types/FeatureProviderInput";
import {
    FeatureName,
    FeatureProvider,
    FeaturesNames,
    FeaturesProvider,
    FeatureValue,
    MapFeature,
    NotImplementedError
} from "../../ProviderBase";
import {mapToMapFeature} from "../../utils/featuresValuesTransformers";

class CommonClassFeaturesProvider extends FeaturesProvider<IApiEntityView> {
    getValues(input: FeatureProviderInput<IApiEntityView>): FeatureValue[] {
        return input.entityContext.classEntity == undefined ? this.getConstFeaturesValues("") : this.getValuesImpl(input);
    }

    getValuesImpl(input: FeatureProviderInput<IApiEntityView>): FeatureValue[] {
        throw new NotImplementedError();
    }
}

class CommonClassFeatureProvider extends FeatureProvider<IApiEntityView> {
}

@FeaturesNames([
    "ClassName",
    "HasClassName",
])
class ClassNameFeaturesProvider extends CommonClassFeaturesProvider {
    getValues(input: FeatureProviderInput<IApiEntityView>): [string, boolean] {
        const className = input.entityContext.classEntity?.className ?? "";

        return [
            className,
            !_.isEmpty(className),
        ];
    }
}

@FeaturesNames([
    "ClassDecorators",
    "HasClassDecorators",
])
class ClassDecoratorsFeaturesProvider extends CommonClassFeaturesProvider {
    getValuesImpl(input: FeatureProviderInput<IApiEntityView>): [string[], boolean] {
        const classDecorators = input.entityContext.classEntity?.decorators ?? [];

        return [
            classDecorators.map(decorator => decorator.decoratorName),
            !_.isEmpty(classDecorators),
        ];
    }
}

@FeatureName("IsAbstractClass")
class AbstractClassFeatureProvider extends CommonClassFeatureProvider {
    getValue = (input: FeatureProviderInput<IApiEntityView>): boolean =>
        input.entityContext.classEntity == undefined ? false : (input.entityContext.classEntity?.isAbstract || false);
}

@FeaturesNames([
    "ClassExtendedClassesFullNames",
    "ClassExtendedClassesNames",
])
class ExtendedClassFeaturesProvider extends CommonClassFeaturesProvider {
    getValuesImpl = (input: FeatureProviderInput<IApiEntityView>): [string[], string[]] => 
        getNamesFromClassProperty(input.entityContext.classEntity, "extendedClass")
            .map(name => name === "" ? [] : [name]) as [string[], string[]];
}

@FeaturesNames([
    "ClassImplementedInterfaceFullName",
    "ClassImplementedInterfaceName",
])
class ImplementedInterfaceFeaturesProvider extends CommonClassFeaturesProvider {
    getValuesImpl = (input: FeatureProviderInput<IApiEntityView>): [string, string] => getNamesFromClassProperty(input.entityContext.classEntity, "implementedInterface");
}

@FeatureName("ClassPropertiesJson")
class ClassPropertiesFeatureProvider extends CommonClassFeatureProvider {
    getValue = (input: FeatureProviderInput<IApiEntityView>): MapFeature =>
        input.entityContext.classEntity == undefined ? {} : mapToMapFeature(input.entityContext.classEntity?.getClassPropertyNameToType() || new Map<string, string>());
}

const getNamesFromClassProperty = (classEntity: ClassEntity | undefined, propertyName: string): [string, string] => {
    const fullName = classEntity?.[propertyName] ?? "";
    if (!fullName) {
        return ["", ""];
    }

    return fullName.includes(".") ? [fullName, fullName.split(".").pop()] : [fullName, fullName];
};

export const CommonClassFeaturesProviders = [
    ClassNameFeaturesProvider,
    ClassDecoratorsFeaturesProvider,
    AbstractClassFeatureProvider,
    ExtendedClassFeaturesProvider,
    ImplementedInterfaceFeaturesProvider,
    ClassPropertiesFeatureProvider
];
