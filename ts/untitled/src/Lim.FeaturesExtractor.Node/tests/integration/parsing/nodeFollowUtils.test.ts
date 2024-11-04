import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import 'mocha';
import {CallExpressionEntity} from "../../../src/models/entities/CallLikeEntities";
import {findCallExpressionByTextAndPath, getTestContext, runParserFlow} from "../integrationTestUtils";

chai.use(chaiArrays);

describe('Test following nodes while parsing', () => {
    const testContext = getTestContext("NodeFollowUtilsExamples");

    before(async () => {
        await runParserFlow(testContext);
    });

    describe('Test that self referencing symbol declaration avoids cyclic loop', () => {
        let getSnippetWithLoop: CallExpressionEntity;
        let postSnippetWithLoop: CallExpressionEntity;

        it('Cyclic loop is avoided when resolving parameters of an API', () => {
            getSnippetWithLoop = findCallExpressionByTextAndPath(
                "client.get",
                "ApisWithSelfReferencingSymbolDeclaration.js",
                testContext
            )!;
            expect(getSnippetWithLoop).to.not.be.undefined;
        });

        it('Another api in file', () => {
            postSnippetWithLoop = findCallExpressionByTextAndPath(
                "client.post",
                "ApisWithSelfReferencingSymbolDeclaration.js",
                testContext
            )!;
            expect(getSnippetWithLoop).to.not.be.undefined;
        });

    });
});


