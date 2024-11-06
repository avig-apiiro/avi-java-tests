import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import 'mocha';
import {getApiFeaturesExtractor} from "../../../src/features/extractors/ApiFeaturesExtractor";
import {FeaturesExtractor} from "../../../src/features/extractors/FeaturesExtractor";
import {formatLabel} from "../../../src/features/providers/ProviderBase";
import {CallExpressionEntity} from "../../../src/models/entities/CallLikeEntities";
import {SnippetType} from "../../../src/models/entities/SnippetEntity";
import {ApiEntityViewFactory} from "../../../src/models/entityViews/ApiEntityViewFactory";
import {IApiEntityView} from "../../../src/models/entityViews/IApiEntityView";
import {Context} from "../../../src/types/Context";
import {findEntity, getFeaturesMap, runParserFlow} from "../integrationTestUtils";

chai.use(chaiArrays);

describe("API Labels feature extraction", function () {
    let testContext: Context;
    let featuresExtractor: FeaturesExtractor<IApiEntityView>;

    before(async () => {
        const [directoryPath, correlationId] = ["tests/projects/ApiLabels", "TEST"];
        testContext = new Context(correlationId, directoryPath);
        await runParserFlow(testContext);
        featuresExtractor = getApiFeaturesExtractor(directoryPath, correlationId);
    });

    describe('Express-style route definition label', function () {
        const featureName = formatLabel("ApiLabel", "ExpressStyleRouteDefinition");
        const routeFeatureName = "SuspectedApiRoute";

        const testCases: Record<string, [string | RegExp, boolean | string][]> = {
            'express.ts': [
                [/routeApp.route\(.*\)\s*\.get/g, true],
                ["routeApp.route", false],
                ["innerThing.get", false],
                ["app.post", true],
                ["app.get", true],
                ["otherApp.post", true],
                ["otherApp.get", false],
                ["otherApp.unrelatedMethod", false],
                ["client.get", false],
                ["namedHandlersApp.get", true],
                ["namedHandlersApp.post", false],
                ["namedHandlersApp.delete", false],
            ],
            'koa.ts': [
                ["router.post", true],
                ["router.get", true],
                [/router\s*\.get\(.*\)\s+\.post/s, true],
                [/router\s*\.get\(.*\)\s+\.post\(.*\)\s+\.delete/s, true],
            ],
            'express-style.js': [
                [/app\s*\.route\("\/thing\/do"\)\s*\.post/s, true],
                [/app\s*\.route\("\/otherThing\/do"\)\s*\.post/s, true],
                [/app\s*\.route\(routePrefix \+ "\/stringConcat"/, "/api/v1/stringConcat"],
                [/app\s*\.route\(`\$\{routePrefix\}\/stringTemplate`\)/, "/api/v1/stringTemplate"]
            ],
            'mockingApis.ts': [
                ["rest.get", false],
            ]
        };

        Object.entries(testCases).forEach(([fileName, expectedExpressionValues]) => {
            describe(`In '${fileName}'`, () => {
                expectedExpressionValues.forEach(([expressionText, expectedValue]) => {
                    it(`Labels '${expressionText}' with ${featureName} = ${expectedValue}`, () => {
                        const expressionTextPredicate = (expressionText instanceof RegExp ?
                                (entity: CallExpressionEntity) => expressionText.test(entity.callExpressionFullText) :
                                (entity: CallExpressionEntity) => entity.callExpressionFullText === expressionText
                        );
                        const entity = findEntity(
                            testContext.parserState.callExpressionEntitiesByKey.values(),
                            SnippetType.CallExpression,
                            entity => entity.path === fileName,
                            expressionTextPredicate);

                        if (!entity) {
                            throw new Error(`Cannot find entity using expression text ${expressionText}`);
                        }
                        const features = getFeaturesMap(entity, ApiEntityViewFactory, featuresExtractor, testContext);

                        if (typeof (expectedValue) == 'boolean') {
                            expect(features.get(featureName)).to.equal(expectedValue);
                        } else {
                            expect(features.get(featureName)).to.be.true;
                            expect(features.get(routeFeatureName)).to.equal(expectedValue);
                        }
                    });
                });
            });
        });
    });

    function assertExpectedFeatureValue(featureName: string, expressionText: string, line: number, expectedValue, path) {
        it(`Labels ${expressionText} with ${featureName} = ${expectedValue}`, function () {
            const entity = findEntity(
                testContext.parserState.callExpressionEntitiesByKey.values(),
                SnippetType.CallExpression,
                entity => entity.path === path,
                (entity: CallExpressionEntity) => entity.callExpressionFullText === expressionText && entity.line === line);
            if (!entity) {
                throw new Error(`Cannot find entity using expression text ${expressionText}`);
            }
            const features = getFeaturesMap(entity, ApiEntityViewFactory, featuresExtractor, testContext);
            expect(features.get(featureName)).to.equal(expectedValue);
        });
    }

    describe('Test NestJS features', function () {
        const testCases: [string, number, boolean, string][] = [
            ["Post", 4, false, ""],
            ["Get", 13, true, "/"],
            ["Post", 18, true, "/green"],
            ["Get", 27, true, "/blue"],
            ["Post", 32, true, "/blue/yellow"]
        ];
        testCases.forEach(([expressionText, line, expectedValue, _]) => {
            assertExpectedFeatureValue(
                "!ApiLabel!NestJS", expressionText, line, expectedValue, "nestjs.ts"
            );
        });

        testCases.forEach(([expressionText, line, _, expectedValue]) => {
            assertExpectedFeatureValue(
                "SuspectedApiRoute", expressionText, line, expectedValue, "nestjs.ts"
            );
        });


    });

    describe('Test Papaya backend features', function () {
        const testCases: [string, number, boolean, string][] = [
            ["ApiMethod", 10, true, "/org/:apiiro-is-the-best"],
            ["ApiMethod", 24, true, "/org/:orgId/100m/roundb"],

        ];
        testCases.forEach(([expressionText, line, expectedValue, _]) => {
            assertExpectedFeatureValue(
                "!ApiLabel!Papaya", expressionText, line, expectedValue, "papaya-apis.ts"
            );
        });

        testCases.forEach(([expressionText, line, _, expectedValue]) => {
            assertExpectedFeatureValue(
                "SuspectedApiRoute", expressionText, line, expectedValue, "papaya-apis.ts"
            );
        });


    });

    describe('Test ServerJS features', function () {
        const testCases: [string, number, boolean, string][] = [
            ["get", 9, true, "/get1"],
            ["get", 10, true, "/get2"],
            ["del", 11, true, "/"],
            ["post", 12, true, "/post/1"],
            ["post", 13, true, "/post/2"],
            ["get", 14, false, ""]
        ];
        testCases.forEach(([expressionText, line, expectedValue, _]) => {
            assertExpectedFeatureValue(
                "!ApiLabel!ServerJS", expressionText, line, expectedValue, "serverjs.ts"
            );
        });

        testCases.forEach(([expressionText, line, _, expectedValue]) => {
            assertExpectedFeatureValue(
                "SuspectedApiRoute", expressionText, line, expectedValue, "serverjs.ts"
            );
        });
    });

    describe('Test SFRA features', function () {
        const testCases: [string, number, boolean, string][] = [
            ["server.get", 3, true, "/sfra-Show"],
            ["server.post", 8, true, "/sfra-Post1"],
            ["server.post", 12, true, "/sfra-Post2"],
            ["server.use", 16, false, ""],
            ["server.get", 20, false, ""]
        ];
        testCases.forEach(([expressionText, line, expectedValue, _]) => {
            assertExpectedFeatureValue(
                "!ApiLabel!SFRA", expressionText, line, expectedValue, "sfra.ts"
            );
        });

        testCases.forEach(([expressionText, line, _, expectedValue]) => {
            assertExpectedFeatureValue(
                "SuspectedApiRoute", expressionText, line, expectedValue, "sfra.ts"
            );
        });
    });

    describe('Test Hapi features', function () {
        const testCases: [string, number, boolean, string][] = [
            ["server.route", 2, true, "/getgetget"],
            ["server.route", 20, true, "/postpostpost"],

        ];
        testCases.forEach(([expressionText, line, expectedValue, _]) => {
            assertExpectedFeatureValue(
                "!ApiLabel!HapiRoute", expressionText, line, expectedValue, "hapi.ts"
            );
        });

        testCases.forEach(([expressionText, line, _, expectedValue]) => {
            assertExpectedFeatureValue(
                "SuspectedApiRoute", expressionText, line, expectedValue, "hapi.ts"
            );
        });
    });

});
