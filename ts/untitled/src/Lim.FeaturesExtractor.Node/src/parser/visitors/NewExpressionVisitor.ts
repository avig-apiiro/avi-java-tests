import _ from "lodash";
import ts from "typescript";
import {NewExpressionEntity} from "../../models/entities/CallLikeEntities";
import {EntityKey} from "../../models/entities/EntityKey";
import {Context} from "../../types/Context";
import {CallLikeVisitorBase} from "./CallLikeVisitorBase";

export class NewExpressionVisitor extends CallLikeVisitorBase<ts.NewExpression, NewExpressionEntity> {
    shouldVisit = ts.isNewExpression;

    public constructor(typeChecker: ts.TypeChecker, context: Context) {
        super(typeChecker, context, __filename);
    }

    protected visitBeforeChildrenImpl(node: ts.NewExpression, entityKey: EntityKey): void {
        const entity = new NewExpressionEntity(entityKey);

        this.populateEntityInformation(entity, node);

        if (!this.shouldDismissEntity(entity)) {
            this.parserState.setNewExpressionEntity(entity);
        }
    }

    private shouldDismissEntity(entity: NewExpressionEntity): boolean {
        if (_.isEmpty(entity.callExpressionArguments)) {
            this.logger.silly("Dismissing new expression with no arguments");
            return true;
        }

        return false;
    }
}
