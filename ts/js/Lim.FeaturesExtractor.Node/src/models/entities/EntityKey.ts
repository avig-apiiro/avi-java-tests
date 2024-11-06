import ts from "typescript";

export class EntityKey {
    constructor(readonly path: string, readonly start: ts.LineAndCharacter, readonly end: ts.LineAndCharacter, readonly type: ts.SyntaxKind) {
    }

    keyString(): string {
        const uidParts = [
            this.path.split("/").join("__"),
            ...[
                this.start.line,
                this.start.character,
                this.end.line,
                this.end.character
            ].map(key => key.toString())
        ];

        return uidParts.join("+");
    }
}
