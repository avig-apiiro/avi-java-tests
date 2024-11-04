import {IEntityView} from "./IEntityView";

export interface IDataModelEntityView extends IEntityView {
    getDataModelName(): string;

    getDataModelMethodsCount(): number;

    getDataModelProperties(): Map<string, string>;

    isConfirmedDataModel?: boolean;
}
