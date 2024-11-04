import {Memoize} from "typescript-memoize";
import {DecoratorEntity} from "./DecoratorEntity";
import {EntityKey} from "./EntityKey";
import {SnippetEntity, SnippetType} from "./SnippetEntity";

export class ClassEntity extends SnippetEntity {
    snippetType = SnippetType.ClassDeclaration;

    decorators: DecoratorEntity[] = [];
    isExported: boolean;
    isDefault: boolean;
    isAbstract: boolean;
    extendedClass?: string;
    extendedClassKey?: EntityKey;
    inheritedPropertyNameToType?: Map<string, string>;

    implementedInterface: string;
    propertyNameToType: Map<string, string> = new Map<string, string>();
    methodCount: number;

    constructor(entityKey: EntityKey, readonly className: string) {
        super(entityKey);
    }

    get localClassPropertyNameToType(): Map<string, string> {
        return this.propertyNameToType;
    }

    get inheritedClassPropertyNameToType(): Map<string, string> {
        if (this.inheritedPropertyNameToType == undefined) {
            throw new Error("Attempt to access inherited class properties before they were populated.");
        }
        return this.inheritedPropertyNameToType;
    }

    set inheritedClassPropertyNameToType(properties: Map<string, string>) {
        if (this.inheritedPropertyNameToType != undefined) {
            throw new Error("Attempt to populate inherited class properties when they are already populated.");
        }
        this.inheritedPropertyNameToType = properties;
    }

    addProperty(propertyName: string, propertyType: string) {
        this.propertyNameToType.set(propertyName, propertyType);
    }

    @Memoize()
    getClassPropertyNameToType(): Map<string, string> {
        return new Map(
            [
                ...this.localClassPropertyNameToType ?? [],
                ...this.inheritedClassPropertyNameToType ?? []
            ]
        );
    }

    getRoutingControllersDefinedRoute(): string | undefined {
        const routesDefinedInDecorators = this.decorators.map(decorator => decorator.getRoutingControllerDefinedRoute()).filter(route => route != undefined);
        if (routesDefinedInDecorators.length === 1){
            return routesDefinedInDecorators[0];
        }
        return undefined;
    }

    getNestJsDefinedRoute(): string | undefined {
        const routesDefinedInDecorators = this.decorators.map(decorator => decorator.getNestJsDefinedRoute()).filter(route => route != undefined);
        if (routesDefinedInDecorators.length === 1){
            return routesDefinedInDecorators[0];
        }
        return undefined;
    }
}

