import {expect} from 'chai';
import globby from "globby";
import _ from 'lodash';
import 'mocha';
import path from "path";
import {
    CallExpression,
    createWrappedNode,
    ModuleResolutionKind,
    Node,
    PropertyAccessExpression,
    SourceFile,
    SyntaxKind,
    VariableDeclaration
} from "ts-morph";
import ts from 'typescript';
import {createPreprocessingCompilerHost} from "../../src/transformation/preprocessingHost";

describe('Typescript Compiler', () => {
    describe('With JS projects', () => {
        let program: ts.Program;
        let typeChecker: ts.TypeChecker;
        const testProjectRoot = './tests/projects/CompilerWithJsProject/';

        before(() => {
            const compilerOptions: ts.CompilerOptions = {
                allowJs: true,
                allowSyntheticDefaultImports: true,
                moduleResolution: ModuleResolutionKind.NodeJs,
                baseUrl: testProjectRoot
            };
            const host = createPreprocessingCompilerHost(compilerOptions, "test");
            let filenames = globby.sync("**/*.js", {cwd: testProjectRoot});
            program = ts.createProgram(filenames.map(f => path.join(testProjectRoot, f)), compilerOptions, host);
            typeChecker = program.getTypeChecker();
        });

        describe('Module resolution', () => {
            it('understands types from external `require` expressions', () => {
                let sourceFile = createWrappedNode<ts.SourceFile>(program.getSourceFile(path.join(testProjectRoot, "app.js"))!, {typeChecker}) as Node;

                const declarationNode = sourceFile.getFirstDescendantOrThrow(node =>
                    Node.isVariableDeclaration(node) &&
                    node.getInitializer()?.getText() == "express()"
                ) as VariableDeclaration;

                const requireNode = sourceFile.getFirstDescendantOrThrow(node =>
                    Node.isCallExpression(node) &&
                    node.getText() == "require('express')"
                ) as CallExpression;

                const invocationNode = sourceFile.getFirstDescendantOrThrow(node =>
                    Node.isCallExpression(node) &&
                    node.getExpression().getText() === 'app.get'
                ) as CallExpression;

                const expressSymbol = requireNode.getType().getCallSignatures()[0].getReturnType().getSymbol();
                expect(expressSymbol).to.not.be.undefined;
                expect(expressSymbol!.getName()).to.equal('Express');

                let initializerNode = declarationNode.getInitializer();
                let ownerNode = (invocationNode.getExpression() as PropertyAccessExpression).getExpression();

                expect(initializerNode!.getType().getSymbol()).to.equal(expressSymbol);
                expect(ownerNode.getType().getSymbol()).to.equal(expressSymbol);
            });

            it("understands types from relative `require` expressions", () => {
                let sourceFile: SourceFile = createWrappedNode(program.getSourceFile(path.join(testProjectRoot, 'app.js'))!, {typeChecker});

                const declarationSymbols = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
                    .filter(variableDeclaration => variableDeclaration.getName().startsWith('userController'))
                    .map(variableDeclaration => variableDeclaration.getInitializer()!.getType().getProperty("listUsers"));

                const usageSymbols = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
                    .filter(propertyAccess => propertyAccess.getExpression().getText().startsWith('userController'))
                    .map(propertyAccess => propertyAccess.getSymbol());

                for (const [declarationSymbol, usageSymbol] of _.zip(declarationSymbols, usageSymbols)) {
                    expect(declarationSymbol).to.equal(usageSymbol);
                }

                expect(declarationSymbols.length).to.equal(4, "detecting all declarations");
                expect(usageSymbols.length,).to.equal(4, "detecting all method references");
                expect(new Set(declarationSymbols).size).to.equal(1, "all declarations should resolve to the same symbol");
                expect(new Set(usageSymbols).size).to.equal(1, "all method references should resolve to the same symbol");
            });
        });
    });
});
