import {SnippetEntity, SnippetType} from "./SnippetEntity";
import {EntityKey} from "./EntityKey";

export enum FunctionType {
    method,
    functionDeclaration,
    functionExpression,
    arrowFunction,
    constructor,
    getter,
    setter,
    other
}

export class FunctionLikeEntity extends SnippetEntity {
    snippetType = SnippetType.FunctionDeclaration;

    functionType: FunctionType;
    functionName: string;
    isRealName: boolean;
    bodyLength: number;
    returnType: string;
    isGetter: boolean;
    isSetter: boolean;
    isConstructor: boolean;
    hasDoc: boolean;
    isPrivate: boolean;
    isAbstract: boolean;
    containsAuthentication: boolean;
    uniqueName: string;
    externalMethodCalls: string[] = [];
    internalMethodCalls: string[] = [];
    thisAssignedMembers: string[] = [];
    private _parametersTypeByName: Map<string, string> = new Map<string, string>();

    constructor(readonly key: EntityKey) {
        super(key);
    }

    getParameters = (): Map<string, string> => this._parametersTypeByName;
    addParameter = (paramName: string, paramType: string) => this._parametersTypeByName.set(paramName, paramType);
}

