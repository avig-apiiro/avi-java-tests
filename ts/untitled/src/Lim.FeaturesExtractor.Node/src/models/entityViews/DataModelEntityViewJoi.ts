import ts from "typescript";
import {CallExpressionEntity} from "../entities/CallLikeEntities";
import {ModuleEntity} from "../entities/ModuleEntity";
import {extractProperties} from "../utils/propertiesExtractor";
import {EntityViewBase} from "./EntityViewBase";
import {IDataModelEntityView} from "./IDataModelEntityView";

export class DataModelEntityViewJoi extends EntityViewBase<CallExpressionEntity> implements IDataModelEntityView {
    static isJoi(entity: CallExpressionEntity, module: ModuleEntity): boolean {
        const importsJoi = () => module.hasImport('joi');
        const invokesKeys = () => entity.callExpressionFuncName === "keys";
        const firstArgObjectLiteral = () => entity.callExpressionArguments[0].kind === ts.SyntaxKind.ObjectLiteralExpression;

        return importsJoi() && invokesKeys() && firstArgObjectLiteral();
    }

    getDataModelMethodsCount(): number {
        return 0;
    }

    getDataModelName(): string {
        return this.entity.variableDeclarationName;
    }

    getDataModelProperties(): Map<string, string> {
        return extractProperties(this.entity.callExpressionArguments[0].objectValue!);
    }
}
