import _ from "lodash";
import ts from "typescript";
import {Memoize} from "typescript-memoize";

import {getNodeTypeString, getTypeCallability} from "../../parser/visitors/utils/nodeCommonUtils";
import {ObjectMap} from "../../parser/visitors/utils/nodeObjectLiteralUtils";
import {Context} from "../../types/Context";
import {TypeCallability} from "../../types/TypeCallability";
import {EntityKey} from "./EntityKey";
import {EntityReference} from "./EntityReference";
import {SnippetEntity, SnippetType} from "./SnippetEntity";

export interface ArgumentInfo {
    kind: ts.SyntaxKind;
    type: ts.Type;
    typeString: string;
    literalValue?: string;
    objectValue?: ObjectMap;
    entityReference?: EntityReference;
    callability: TypeCallability;
}

export abstract class CallLikeEntity extends SnippetEntity {
    callExpressionArguments: ArgumentInfo[] = [];

    callExpressionFullText: string;
    callExpressionTargetType: string;

    callExpressionIsParenthesized: boolean;
    callExpressionIsPropertyAccess: boolean;

    displayString: string;
    methodInvocationOwnerText: string;
    methodInvocationOwnerType: string;
    methodInvocationMethodName: string;
    rootRoutePath: string | undefined;
    routingControllersRootRoutePath: string | undefined;
    nestJsRootRoutePath: string | undefined;
    shouldRemoveApi = false;
    InternalReferencedMethods: string[];
    ExternalReferencedMethods: string[];

    abstract snippetType: SnippetType;

    constructor(readonly key: EntityKey) {
        super(key);
        this.InternalReferencedMethods = [];
        this.ExternalReferencedMethods = [];
    }

    get firstArgString(): string | undefined {
        if (_.isEmpty(this.callExpressionArguments)) {
            return undefined;
        }

        const firstArg = this.callExpressionArguments[0];
        const isFirstArgStringLiteral = [ts.SyntaxKind.StringLiteral, ts.SyntaxKind.TemplateExpression].includes(firstArg.kind);
        return isFirstArgStringLiteral ? firstArg.literalValue : undefined;
    }

    @Memoize()
    get callExpressionFuncName(): string {
        const splitName = this.callExpressionFullText.split(".");
        return (splitName[splitName.length - 1]);
    }

    getEntityReferences(): ReadonlyArray<EntityReference> {
        return _.compact(this.callExpressionArguments.map(arg => arg.entityReference));
    }

    addArgument(kind: ts.SyntaxKind, type: ts.Type, typeString: string, literalValue: string, objectPropertiesStructure: ObjectMap, referencedEntityKey: EntityKey | undefined) {
        this.callExpressionArguments.push({
            kind,
            type,
            typeString,
            literalValue,
            objectValue: objectPropertiesStructure,
            entityReference: referencedEntityKey === undefined ? undefined : new EntityReference(referencedEntityKey),
            callability: getTypeCallability(type),
        });
    }

    processCallLeftHand(callTargetText: string, callTarget: ts.Expression, typeChecker: ts.TypeChecker, parserContext: Context) {
        this.callExpressionFullText = callTargetText;
        this.callExpressionIsParenthesized = ts.isParenthesizedExpression(callTarget);
        this.callExpressionIsPropertyAccess = ts.isPropertyAccessExpression(callTarget);
        this.callExpressionTargetType = getNodeTypeString(callTarget, typeChecker, parserContext);

        if (this.callExpressionIsPropertyAccess) {
            const callTargetPropertyAccessExpression = callTarget as ts.PropertyAccessExpression;
            this.methodInvocationMethodName = callTargetPropertyAccessExpression.name.text;
            this.methodInvocationOwnerText = callTargetPropertyAccessExpression.expression.getText();
            this.methodInvocationOwnerType = getNodeTypeString(callTargetPropertyAccessExpression.expression, typeChecker, parserContext);
        }
    }

    /*
    Checks whether the invoked expression matches an expected signature, provided as a list of predicates applied
    in order to the expression's arguments.

      - `requiredArgumentPredicates`: List of predicates to be applied to the expression's arguments, where each predicate requires its argument to appear
        (if the expression has less arguments than the predicates in this list, the matching fails).
      - `optionalArgumentPredicates`: List of predicates to be applied to the expression's subsequent arguments, allowing for missing arguments
        (each predicate is only checked if it has a corresponding argument).
      - `restPredicate`: A predicate to be applied to any remaining arguments after all the required and optional predicates have been tested.

      Predicates can be provided as `(ArgumentInfo => boolean)` functions, or as boolean values, where `true` always succeeds and `false` always fails.
      Note that `false` can only be provided for the `restPredicate`, which would cause any extra arguments to fail the matching (this is the default behavior).

      For example:

      - to test whether a call expression has a second argument which is a string literal (and a first argument which can be anything):
        ```
        entity.matchesSignature([true, secondArg => secondArg.kind === ts.SyntaxKind.StringLiteral)
        ```
      - to test whether a call expression matches `(string, string, boolean?)`:
        ```
        entity.matchesSignature([
          arg1 => hasAnyFlag(arg1.type.flags, ts.TypeFlags.StringLike),
          arg2 => hasAnyFlag(arg2.type.flags, ts.TypeFlags.StringLike),
        ], [
          arg3 => hasAnyFlag(arg3.type.flags, ts.TypeFlags.BooleanLike)
        ])
        ```
    */
    matchesSignature(
        requiredArgumentPredicates: (Predicate<ArgumentInfo> | true)[],
        optionalArgumentPredicates: (Predicate<ArgumentInfo> | true)[] = [],
        restPredicate: Predicate<ArgumentInfo> | boolean = false
    ) {
        const args = this.callExpressionArguments;

        const missingPredicates = args.length - requiredArgumentPredicates.length - optionalArgumentPredicates.length;
        const argumentPredicates: Predicate<ArgumentInfo | undefined>[] = [
            ...requiredArgumentPredicates.map(predicate => expandPredicate(predicate, false)),
            ...optionalArgumentPredicates.map(predicate => expandPredicate(predicate, true)),
            ...(missingPredicates > 0 ? new Array(missingPredicates).fill(expandPredicate(restPredicate, false)) : [])
        ];

        return _.zip(args, argumentPredicates).every(([arg, predicate]) => predicate!(arg));

        function expandPredicate(predicate: Predicate<ArgumentInfo> | boolean, allowMissingArgument: boolean) {
            return arg => {
                if (arg == undefined) {
                    return allowMissingArgument;
                }

                if (typeof predicate === 'boolean') {
                    return predicate;
                }

                return predicate(arg);
            };
        }
    }

    hasMinimumArgumentsCount(minArgs: number) { return this.callExpressionArguments.length >= minArgs; }
}

type Predicate<T> = (value: T) => boolean;

export interface SiblingsInfo {
    methodCounts: _.Dictionary<number>;
    httpMethodsCount: number;
    appFrameworkMethodsCount: number;
    otherMethodCount: number;
}

export class CallExpressionEntity extends CallLikeEntity {
    snippetType = SnippetType.CallExpression;

    siblingsInfo: SiblingsInfo;
    callExpressionIsDecorator: boolean;
    moduleImportsServer: boolean = false;
}

export class NewExpressionEntity extends CallLikeEntity {
    snippetType = SnippetType.NewExpression;
}
