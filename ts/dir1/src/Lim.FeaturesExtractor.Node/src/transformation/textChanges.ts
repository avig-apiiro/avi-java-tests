import ts from "typescript";

export interface TextChange {
    span: ts.TextSpan,
    newText: string
}

export type TextChangeGenerator = (sourceFile: ts.SourceFile) => TextChange[];

export function textChangeForNode(newText: string, node: ts.Node): TextChange {
    return {
        span: {start: node.getStart(), length: node.getEnd() - node.getStart()},
        newText: newText
    };
}
