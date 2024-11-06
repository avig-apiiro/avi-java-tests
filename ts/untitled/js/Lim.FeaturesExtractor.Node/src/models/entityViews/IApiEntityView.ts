import {IEntityView} from "./IEntityView";

export interface IApiEntityView extends IEntityView {
    getSuspectedApiMethod(): string | undefined;

    getSuspectedApiRoute(): string | undefined;

    getDisplayString(): string | undefined;
}
