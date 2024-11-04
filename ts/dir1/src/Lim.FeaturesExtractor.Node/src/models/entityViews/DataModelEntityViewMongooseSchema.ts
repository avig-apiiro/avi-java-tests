import ts from "typescript";
import {Memoize} from "typescript-memoize";
import {hasAnyFlag} from "../../parser/visitors/utils/nodeCommonUtils";
import {ObjectMap, ObjectMapValue} from "../../parser/visitors/utils/nodeObjectLiteralUtils";
import {CallExpressionEntity, NewExpressionEntity} from "../entities/CallLikeEntities";
import {EntityViewBase} from "./EntityViewBase";
import {IDataModelEntityView} from "./IDataModelEntityView";

export class DataModelEntityViewMongoose extends EntityViewBase<CallExpressionEntity> implements IDataModelEntityView {
    private get schemaEntity(): NewExpressionEntity {
        return this.entity.callExpressionArguments[1].entityReference?.entity as NewExpressionEntity;
    }

    static isMongooseModel(entity: CallExpressionEntity) {
        // Test for `(...).model(name: string, schema: Schema, collection?: string, skipInit?: boolean)`
        return entity.methodInvocationMethodName === 'model' && entity.matchesSignature(
            [
                (nameArg) => nameArg.kind === ts.SyntaxKind.StringLiteral,
                (schemaArg) => {
                    const schemaEntity = schemaArg.entityReference?.entity;
                    if (!(schemaEntity instanceof NewExpressionEntity)) {
                        return false;
                    }

                    // Test for `new Schema({...}, options?: object)`
                    return (/Schema(<.*>)?/.test(schemaEntity.callExpressionTargetType) &&
                        schemaEntity.matchesSignature(
                            [
                                pathsArg => pathsArg.kind === ts.SyntaxKind.ObjectLiteralExpression
                            ],
                            [
                                optionsArg => hasAnyFlag(optionsArg.type.getFlags(), ts.TypeFlags.Object | ts.TypeFlags.Any | ts.TypeFlags.Unknown)
                            ]
                        ));
                }
            ],
            [
                (collectionArg) => hasAnyFlag(collectionArg.type.getFlags(), ts.TypeFlags.StringLike),
                (skipInitArg) => hasAnyFlag(skipInitArg.type.getFlags(), ts.TypeFlags.BooleanLike)
            ]);
    }

    getDataModelMethodsCount(): number {
        return 0;
    }

    getDataModelName(): string {
        return this.entity.callExpressionArguments[0].literalValue as string;
    }

    @Memoize()
    getDataModelProperties(): Map<string, string> {
        return expandObjectPaths(
            this.schemaEntity.callExpressionArguments[0].objectValue!,
            extractMongooseType,
            translateEmptyArrays,
            canonicalizeTypeName);

        function extractMongooseType(value: ObjectMapValue): ObjectMapValue {
            if (typeof value === "object" && value.hasOwnProperty("type")) {
                return extractMongooseType(value["type"]);
            }

            return value;
        }

        function translateEmptyArrays(value: ObjectMapValue): ObjectMapValue {
            if (Array.isArray(value) && value.length === 0) {
                return ["Mixed"];
            }
            return value;
        }

        function canonicalizeTypeName(value: ObjectMapValue): ObjectMapValue {
            if (typeof value !== 'string') {
                return value;
            }

            return value.slice(value.lastIndexOf('.') + 1);
        }
    }
}

function expandObjectPaths(objectValue: ObjectMap, ...valueFilters: ((value: ObjectMapValue) => ObjectMapValue)[]): Map<string, string> {
    const paths = new Map<string, string>();
    const keysStack: string[] = [];

    collectValue(objectValue);
    return paths;

    function collectValue(value: ObjectMapValue) {
        value = valueFilters.reduce((val, filter) => filter(val), value);

        if (value == undefined) {
            return;
        }
        if (value instanceof Array) {
            value.forEach(collectValue);
        } else if (typeof value === "object") {
            Object.entries(value).forEach(([key, subValue]) => {
                keysStack.push(key);
                collectValue(subValue);
                keysStack.pop();
            });
        } else {
            paths.set(keysStack.join('.'), value);
        }
    }
}
