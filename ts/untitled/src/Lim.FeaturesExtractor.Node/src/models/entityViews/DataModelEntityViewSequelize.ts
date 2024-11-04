import ts from "typescript";
import {ObjectMap} from "../../parser/visitors/utils/nodeObjectLiteralUtils";
import {CallExpressionEntity} from "../entities/CallLikeEntities";
import {ModuleEntity} from "../entities/ModuleEntity";
import {extractProperties} from "../utils/propertiesExtractor";
import {EntityViewBase} from "./EntityViewBase";
import {IDataModelEntityView} from "./IDataModelEntityView";

export class DataModelEntityViewSequelizeDefine extends EntityViewBase<CallExpressionEntity> implements IDataModelEntityView {
    static isSequelizeDefine(entity: CallExpressionEntity, module: ModuleEntity): boolean {
        const invokesDefine = () => entity.callExpressionFuncName === "define";
        const argCountEnough = () => entity.callExpressionArguments.length >= 2;
        const firstArgStringLiteral = () => entity.callExpressionArguments[0].kind === ts.SyntaxKind.StringLiteral;
        const secondArgObjectLiteral = () => entity.callExpressionArguments[1].kind === ts.SyntaxKind.ObjectLiteralExpression;

        return invokesDefine() && argCountEnough() && firstArgStringLiteral() && secondArgObjectLiteral();
    }

    getDataModelMethodsCount(): number {
        return 0;
    }

    getDataModelName(): string {
        return this.entity.callExpressionArguments[0].literalValue!;
    }

    getDataModelProperties(): Map<string, string> {
        return extractProperties(this.entity.callExpressionArguments[1].objectValue!);
    }
}

export class DataModelEntityViewSequelizeInit extends EntityViewBase<CallExpressionEntity> implements IDataModelEntityView {
    static isSequelizeInit(entity: CallExpressionEntity, module: ModuleEntity): boolean {
        const importsSequelize = () => module.hasImport('sequelize');
        const invokesInit = () => entity.callExpressionFuncName === "init";
        const matchesSignature = () => entity.matchesSignature([
            (schemaArg) => schemaArg.kind === ts.SyntaxKind.ObjectLiteralExpression,
            (optionsArg) => optionsArg.kind === ts.SyntaxKind.ObjectLiteralExpression
        ]);

        return importsSequelize() && invokesInit() && matchesSignature();
    }

    getDataModelMethodsCount(): number {
        return 0;
    }

    getDataModelName(): string {
        const modelName = this.entity.callExpressionArguments[1].objectValue?.["modelName"];
        if (typeof modelName === "string") {
            return modelName;
        }

        return this.entity.methodInvocationOwnerText;
    }

    getDataModelProperties(): Map<string, string> {
        return extractProperties(this.entity.callExpressionArguments[0].objectValue as ObjectMap);
    }
}
