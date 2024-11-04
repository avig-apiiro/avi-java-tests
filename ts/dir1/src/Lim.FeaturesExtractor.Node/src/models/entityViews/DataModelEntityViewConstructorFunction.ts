import {IDataModelEntityView} from "./IDataModelEntityView";
import {EntityViewBase} from "./EntityViewBase";
import {FunctionLikeEntity, FunctionType} from "../entities/FunctionLikeEntity";
import {Memoize} from "typescript-memoize";

export class DataModelEntityViewConstructorFunction extends EntityViewBase<FunctionLikeEntity> implements IDataModelEntityView {
    static isConstructorFunction(entity: FunctionLikeEntity): boolean {
        return (
            [FunctionType.functionDeclaration, FunctionType.functionExpression].includes(entity.functionType) &&
            entity.functionName != "" &&
            entity.isRealName &&
            entity.classKey == "" &&
            entity.thisAssignedMembers.length > 0
        );
    }

    getDataModelMethodsCount(): number {
        return 0;
    }

    getDataModelName(): string {
        return this.entity.functionName;
    }

    @Memoize()
    getDataModelProperties(): Map<string, string> {
        return new Map(this.entity.thisAssignedMembers.map(memberName => [memberName, 'any']));
    }

    isConfirmedDataModel = false;
}
