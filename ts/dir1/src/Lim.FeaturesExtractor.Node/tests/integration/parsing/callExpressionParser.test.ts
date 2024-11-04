import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import 'mocha';
import {CallExpressionEntity} from "../../../src/models/entities/CallLikeEntities";
import {findCallExpressionByTextAndPath, getTestContext, runParserFlow} from "../integrationTestUtils";

chai.use(chaiArrays);

describe('Test parser for call expression entities', () => {
    const testContext = getTestContext("CallExpressionParsing");

    before(async () => {
        await runParserFlow(testContext);
    });

    describe('Name related properties', () => {
        let appPostSnippet: CallExpressionEntity;

        before(async () => {
            appPostSnippet = findCallExpressionByTextAndPath("app.post", "app.ts", testContext)!;
        });

        it('Call expression function and full name', () => {
            expect(appPostSnippet.callExpressionFullText).to.equal("app.post");
            expect(appPostSnippet.callExpressionFuncName).to.equal("post");
            expect(appPostSnippet.methodInvocationMethodName).to.equal("post");
        });

        it('Sibling method counts should count sibling invocations on same owner', () => {
            expect(appPostSnippet.siblingsInfo.otherMethodCount).to.equal(1);
            expect(appPostSnippet.siblingsInfo.httpMethodsCount).to.equal(2);
            expect(appPostSnippet.siblingsInfo.appFrameworkMethodsCount).to.equal(3);

            const otherAppPostSnippet = findCallExpressionByTextAndPath("otherApp.post", 'app.ts', testContext)!;
            expect(otherAppPostSnippet.siblingsInfo.otherMethodCount).to.equal(1);
            expect(otherAppPostSnippet.siblingsInfo.httpMethodsCount).to.equal(2);
            expect(otherAppPostSnippet.siblingsInfo.appFrameworkMethodsCount).to.equal(0);
        });

    });

    describe('Type Information', () => {
        let appPostSnippet: CallExpressionEntity;
        let clientGetSnippet: CallExpressionEntity;

        before(async () => {
            appPostSnippet = findCallExpressionByTextAndPath("app.post", "app.ts", testContext)!;
            clientGetSnippet = findCallExpressionByTextAndPath("client.get", "app.ts", testContext)!;
        });

        it('Call expression argument types includes string literals and anon function signature', () => {
            expect(appPostSnippet.callExpressionArguments.map(argument => argument.typeString)).to.be.equalTo([
                "string-literal",
                "lambda"
            ]);
            expect(clientGetSnippet.callExpressionArguments.map(argument => argument.typeString)).to.be.equalTo([
                "string-literal",
                "lambda"
            ]);
        });

        it('Call expression target type supports named callable types', () => {
            expect(appPostSnippet.callExpressionTargetType).to.equal('lambda');
        });

        it('Call expression target type supports unnamed signature types', () => {
            expect(clientGetSnippet.callExpressionTargetType).to.equal('lambda');
        });

        it('Call expression args callability supports optional booleans', () => {
            const namedHandlersAppMethodHandlerFeatures = findCallExpressionByTextAndPath("namedHandlersApp.get", 'app.ts', testContext)!;
            const namedHandlersAppUnknownHandlerSnippetFeatures = findCallExpressionByTextAndPath("namedHandlersApp.post", 'app.ts', testContext)!;

            expect(appPostSnippet.callExpressionArguments.map(argument => argument.callability)).to.be.equalTo([0, 1]);
            expect(clientGetSnippet.callExpressionArguments.map(argument => argument.callability)).to.be.equalTo([0, 1]);

            expect(namedHandlersAppMethodHandlerFeatures.callExpressionArguments.map(argument => argument.callability)).to.be.equalTo([0, 1]);
            expect(namedHandlersAppUnknownHandlerSnippetFeatures.callExpressionArguments.map(argument => argument.callability)).to.be.equalTo([0, 2]);
        });
    });

    describe('Method Invocation features', () => {
        it('Call expressions should contain owner text and type', () => {
            const appPostSnippet = findCallExpressionByTextAndPath("app.post", "app.ts", testContext)!;
            expect(appPostSnippet.methodInvocationOwnerText).to.equal("app");
            expect(appPostSnippet.methodInvocationOwnerType).to.include("lambda");

            const otherAppPostSnippetFeatures = findCallExpressionByTextAndPath("otherApp.post", 'app.ts', testContext)!;
            expect(otherAppPostSnippetFeatures.methodInvocationOwnerText).to.equal("otherApp");
            expect(otherAppPostSnippetFeatures.methodInvocationOwnerType).to.not.include("lambda");
        });
    });

    describe('Entity references', () => {
        it('Entities referenced in arguments are resolved', () => {
            const namedHandlersAppPostSnippet = findCallExpressionByTextAndPath('namedHandlersApp.post', 'app.ts', testContext)!;
            const referencedMethodEntity = namedHandlersAppPostSnippet.callExpressionArguments[1].entityReference?.entity as CallExpressionEntity;
            const createHandlerSnippet = findCallExpressionByTextAndPath('UsersController.createHandler', 'app.ts', testContext)!;
            expect(referencedMethodEntity).to.equal(createHandlerSnippet).and.not.be.undefined;
        });
    });
});


