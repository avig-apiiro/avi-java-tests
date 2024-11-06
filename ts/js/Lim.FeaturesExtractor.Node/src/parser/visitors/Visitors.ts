import ts from "typescript";
import {Context} from "../../types/Context";
import {CallExpressionVisitor} from "./CallExpressionVisitor";
import {ClassVisitor} from "./ClassVisitor";
import {DecoratorVisitor} from "./DecoratorVisitor";
import {ImportsVisitor} from "./ImportsVisitor";
import {InterfaceVisitor} from "./InterfaceVisitor";
import {NewExpressionVisitor} from "./NewExpressionVisitor";
import {StringLiteralVisitor} from "./StringLiteralVisitor";
import {VariableDeclarationVisitor} from "./VariableDeclarationVisitor";
import {IVisitor} from "./VisitorBase";
import {MinimalFunctionLikeVisitor} from "./MinimalFunctionLikeVisitor";
import {TypeGraphQLVisitor} from "./TypeGraphQLVisitor";
import {AssignmentStatementVisitor} from "./AssignmentStatementVisitor";

export const Visitors: ({ new(typeChecker: ts.TypeChecker, context: Context): IVisitor })[] = [
    ClassVisitor,
    ImportsVisitor,
    DecoratorVisitor,
    InterfaceVisitor,
    CallExpressionVisitor,
    NewExpressionVisitor,
    StringLiteralVisitor,
    VariableDeclarationVisitor,
    MinimalFunctionLikeVisitor,
    TypeGraphQLVisitor,
    AssignmentStatementVisitor
    // Disabled Wix specific features to ease memory issues cause by https://github.com/apiiro/lim/issues/4949
    //FunctionLikeVisitor,
];
