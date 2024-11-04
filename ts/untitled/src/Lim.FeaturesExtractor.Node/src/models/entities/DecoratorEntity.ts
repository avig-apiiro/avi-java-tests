import {EntityBase} from "./EntityBase";
import {EntityKey} from "./EntityKey";

const _routingControllerRouteDecorators = [
    "Controller",
    "JsonController"
]

export class DecoratorEntity extends EntityBase {
    decoratorName: string;
    decoratorArguments: Array<string>;
    callExpressionKey: EntityKey;

    getRoutingControllerDefinedRoute(): string | undefined {
        if (_routingControllerRouteDecorators.includes(this.decoratorName)) {
            if (this.decoratorArguments.length === 1 && this.decoratorArguments[0].startsWith("/")) {
                return this.decoratorArguments[0];
            }
            if (this.decoratorArguments.length === 0) {
                return '';
            }
        }
        return undefined;
    }

    getNestJsDefinedRoute(): string | undefined {
        if (this.decoratorName === "Controller") {
            if (this.decoratorArguments.length === 1 && !this.decoratorArguments[0].startsWith("/")) {
                return `/${this.decoratorArguments[0]}`;
            }
            if (this.decoratorArguments.length === 0) {
                return '/';
            }

        }
        return undefined;
    }
}
