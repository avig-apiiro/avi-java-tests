import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import 'mocha';
import {ApiEntityViewCallExpression} from "../../../src/models/entityViews/ApiEntityViewCallExpression";
import {findCallExpressionByTextAndPath, getTestContext, runParserFlow} from "../integrationTestUtils";

chai.use(chaiArrays);

describe('Test creating API entities views', () => {
    const testContext = getTestContext("ApiEntityViews");

    before(async () => {
        await runParserFlow(testContext);
    });

    describe("API Entities views", () => {
        describe('Api Candidate Call Expression', () => {
            describe('Express', () => {
                it('Http method name', () => {
                    const appPostSnippetEntity = findCallExpressionByTextAndPath("app.post", "express.ts", testContext)!;

                    const appPostSnippetCandidate = new ApiEntityViewCallExpression(appPostSnippetEntity);
                    expect(appPostSnippetCandidate.httpMethodName).to.equal("post");

                    const nonApiSnippet = findCallExpressionByTextAndPath("otherApp.unrelatedMethod", "express.ts", testContext)!;
                    const nonApiSnippetCandidate = new ApiEntityViewCallExpression(nonApiSnippet);
                    expect(nonApiSnippetCandidate.httpMethodName).to.be.undefined;
                });

            });

            describe('Koa', () => {
                it('Http method name', () => {
                    const appPostSnippetEntity = findCallExpressionByTextAndPath("router.post", "koa.ts", testContext)!;
                    const appPostSnippetCandidate = new ApiEntityViewCallExpression(appPostSnippetEntity);
                    expect(appPostSnippetCandidate.httpMethodName).to.equal("post");

                    const nonApiSnippet = findCallExpressionByTextAndPath("otherApp.unrelatedMethod", "koa.ts", testContext)!;
                    const nonApiSnippetCandidate = new ApiEntityViewCallExpression(nonApiSnippet);
                    expect(nonApiSnippetCandidate.httpMethodName).to.be.undefined;
                });
            });

            describe('routing-controllers', () => {
                it('Suspected API route', () => {
                    const getWithClassPathSnippetEntity = findCallExpressionByTextAndPath("Get", "routing-controllers.ts", testContext)!;
                    const getWithClassPathSnippetCandidate = new ApiEntityViewCallExpression(getWithClassPathSnippetEntity);
                    expect(getWithClassPathSnippetCandidate.getSuspectedApiRoute()).to.equal("/basepath/users");

                    const postWithClassPathSnippetEntity = findCallExpressionByTextAndPath("Post", "routing-controllers.ts", testContext)!;
                    const postWithClassPathSnippetCandidate = new ApiEntityViewCallExpression(postWithClassPathSnippetEntity);
                    expect(postWithClassPathSnippetCandidate.getSuspectedApiRoute()).to.equal("/basepath/userscreate");

                    const deleteWithoutClassPathSnippetEntity = findCallExpressionByTextAndPath("Delete", "routing-controllers.ts", testContext)!;
                    const deleteWithoutClassPathSnippetCandidate = new ApiEntityViewCallExpression(deleteWithoutClassPathSnippetEntity);
                    expect(deleteWithoutClassPathSnippetCandidate.getSuspectedApiRoute()).to.equal("/usersdelete");
                });
            });

        });
    });
});


