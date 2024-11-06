import {expect} from "chai";
import 'mocha';

import ts from "typescript";
import {shouldDismissError} from "../../../src/parser/visitors/VisitorBase";

describe("Test shouldDismissErrors", () => {
    it("Should dismiss", () => {
        const error = new Error("Debug Failure. Did not expect CallExpression to have an Identifier in its trivia");
        expect(shouldDismissError(error, ts.SyntaxKind.CallExpression)).to.be.true;

    });
    it("Shouldn't dismiss - no message match", () => {
        const error = new Error("Debug Failure. Did not expect CallExpression to have an Identifier in its trivia");
        expect(shouldDismissError(error, ts.SyntaxKind.FunctionExpression)).to.be.false;

    });
    it("Shouldn't dismiss - no type match", () => {
        const error = new Error("some error");
        expect(shouldDismissError(error, ts.SyntaxKind.ClassDeclaration)).to.be.false;

    });
});

