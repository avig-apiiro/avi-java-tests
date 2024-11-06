import ts from "typescript";

export const followNodeToDeclaration = (node: ts.Node, typeChecker: ts.TypeChecker) => followNode(node, [
    assignmentFollower,
    getSymbolDeclarationFollower(typeChecker),
    getTypeDeclarationFollower(typeChecker),
    getImportsFollower(typeChecker)
]);

function followNode(node: ts.Node, followers: ((node: ts.Node) => ts.Node | undefined)[], stopPredicate?: (node: ts.Node) => boolean) {
    const visitedNodes = new Set<ts.Node>();
    while (true) {
        if (stopPredicate?.(node)) {
            break;
        }

        let nextNode = node;
        for (const follower of followers) {
            nextNode = follower(node) ?? node;
            if (nextNode !== node) {
                break;
            }
        }

        if (nextNode === node) {
            break;
        }

        if (visitedNodes.has(nextNode)) {
            throw new Error(
                `Cyclic loop detected when following node using followers ${followers.map(f => f.name || '(anonymous)')}:\n` +
                [...visitedNodes, nextNode].map(n => n.getText()).join('\n==>\n'));
        }

        visitedNodes.add(node);
        node = nextNode;
    }

    return node;
}

function assignmentFollower(node: ts.Node): ts.Node | undefined {
    if (ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node)) {
        return node.initializer;
    }

    if (ts.isShorthandPropertyAssignment(node)) {
        return node.objectAssignmentInitializer;
    }

    return undefined;
}

function getSymbolDeclarationFollower(typeChecker: ts.TypeChecker) {
    return function followSymbolDeclarations(node: ts.Node): ts.Node | undefined {
        const symbol = typeChecker.getSymbolAtLocation(node);
        if (symbol == undefined) {
            return undefined;
        }
        const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
        // Ignore symbol declarations that contain a self-assignment, to avoid loops when following nodes (See https://apiiro.atlassian.net/browse/LIM-3600)
        if (declaration && assignmentFollower(declaration) === node) {
            return undefined;
        }
        return declaration;
    };
}

function getTypeDeclarationFollower(typeChecker: ts.TypeChecker) {
    return function followTypeDeclarations(node: ts.Node): ts.Node | undefined {
        if (!ts.isTypeNode(node)) {
            return undefined;
        }

        const type = typeChecker.getTypeAtLocation(node);
        if (type?.symbol == undefined) {
            return undefined;
        }

        return type.symbol.valueDeclaration ?? type.symbol.declarations?.[0];
    }
}


function getImportsFollower(typeChecker: ts.TypeChecker) {
    return function importsFollower(node: ts.Node): ts.Node | undefined {
        if (ts.isImportSpecifier(node) || ts.isImportClause(node)) {
            const symbol = typeChecker.getSymbolAtLocation(node.name ?? node);
            if (symbol == undefined) {
                return undefined;
            }

            const aliasedSymbol = typeChecker.getAliasedSymbol(symbol);
            if (aliasedSymbol == undefined) {
                return undefined;
            }

            return aliasedSymbol.valueDeclaration ?? aliasedSymbol.declarations?.[0];
        }
    };
}
