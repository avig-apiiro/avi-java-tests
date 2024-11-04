import ts from "typescript";

export function getBodyLength(node: ts.Node) {
    const start = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
    const end = node.getSourceFile().getLineAndCharacterOfPosition(node.getEnd());

    return end.line - start.line + 1;
}

export function bodyContains(node: ts.Node, text: string): boolean {
    return node.getFullText().toLowerCase().includes(text.toLowerCase());
}
