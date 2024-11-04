import path from "path";
import ts, {SignatureDeclaration} from "typescript";
import {EntityKey} from "../../../models/entities/EntityKey";
import {Context} from "../../../types/Context";
import {TypeCallability} from "../../../types/TypeCallability";
import {CodeReference} from "../../../models/CodeReference";

export function getNodeEntityKey(node: ts.Node, sourceFilePath: string): EntityKey {
    const sourceFile = node.getSourceFile();
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    return new EntityKey(sourceFilePath, start, end, node.kind);
}

export function getNodeEntityKeyByContext(node: ts.Node, parserContext: Context): EntityKey {
    const sourceFilePath = path.relative(parserContext.directoryPath, node.getSourceFile().fileName);
    return getNodeEntityKey(node, sourceFilePath);
}

export function getNodeCodeReference(node: ts.Node, sourceFilePath: string): CodeReference {
    const sourceFile = node.getSourceFile();
    return new CodeReference(
        sourceFilePath,
        sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
        sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1
    );
}

export function hasFlag<TFlags extends number>(value: TFlags, testedValue: TFlags) {
    return (value & testedValue) === testedValue;
}

export function hasAnyFlag<TFlags extends number>(value: TFlags, testedMask: TFlags) {
    return (value & testedMask) !== 0;
}

export function hasDeclarationModifier(node: ts.Declaration, modifierFlag: ts.ModifierFlags): boolean {
    return hasFlag(ts.getCombinedModifierFlags(node), modifierFlag);
}

export function getNodeTypeString(node: ts.Node, typeChecker: ts.TypeChecker, parserContext: Context) {
    let argType: ts.Type = typeChecker.getTypeAtLocation(node);

    const cacheResult = parserContext.typesCache.get(argType);
    if (cacheResult != undefined) {
        return cacheResult;
    }

    let typeString;
    if (argType.isStringLiteral()) {
        typeString = "string-literal";
    } else if (argType.isNumberLiteral()) {
        typeString = "number-literal";
    } else if (argType.getCallSignatures().length > 0) {
        typeString = "lambda";
    } else {
        typeString = typeChecker.typeToString(argType);
    }

    parserContext.typesCache.set(argType, typeString);

    return typeString;
}

export function getTypeCallability(type: ts.Type): TypeCallability {
    if (hasAnyFlag(type.getFlags(), ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        return TypeCallability.Unknown;
    }

    return type.getCallSignatures().length > 0 ? TypeCallability.Callable : TypeCallability.NonCallable;
}

export function isTypeCallable(type: ts.Type, minArity?: number, maxArity?: number, allowUnknown: boolean = true) {
    if (hasAnyFlag(type.getFlags(), ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        return allowUnknown;
    }

    return type.getCallSignatures().some(signature => {
        const signatureArity = signature.getParameters().length;
        return (
            signatureArity >= (minArity ?? signatureArity) &&
            signatureArity <= (maxArity ?? signatureArity)
        );
    });
}

export function getMethodName(node: SignatureDeclaration): {name: string, isRealName: boolean} {
    let name: string;
    let isRealName = false;
    if (node.name !== undefined) {
        name = node.name.getText();
        isRealName = true;
    } else if (ts.isVariableDeclaration(node.parent)) {
        const parent = node.parent;
        name = parent.name.getText();
        isRealName = true;
    } else {
        name = ts.SyntaxKind[node.kind];
    }
    return {name, isRealName};

}

export function extractSimpleName(node: ts.Expression | ts.QualifiedName | undefined): string | undefined {
    if (!node) {
        return undefined;
    }

    if (ts.isIdentifier(node)) {
        return node.text;
    }

    if (ts.isPropertyAccessExpression(node)) {
        return node.name.text;
    }

    if (ts.isQualifiedName(node)) {
        return node.right.text;
    }

    return undefined;
}