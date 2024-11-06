import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import 'mocha';
import {SnippetType} from "../../../src/models/entities/SnippetEntity";
import {Context} from "../../../src/types/Context";
import {FeaturesExtractor} from "../../../src/features/extractors/FeaturesExtractor";
import {findEntity, getFeaturesMap, runParserFlow} from "../integrationTestUtils";
import {IApiEntityView} from "../../../src/models/entityViews/IApiEntityView";
import {getApiFeaturesExtractor} from "../../../src/features/extractors/ApiFeaturesExtractor";
import {CallExpressionEntity} from "../../../src/models/entities/CallLikeEntities";
import {ApiEntityViewFactory} from "../../../src/models/entityViews/ApiEntityViewFactory";

chai.use(chaiArrays);

const fileName = "ExpressRoutes.ts";
const internalReferencedMethodsFeatureName = "InternalReferencedMethods";
const externalReferencedMethodsFeatureName = "ExternalReferencedMethods";

const authorizedForUniqueName = "MethodDeclaration.ts+0+0+2+1";
const middleware1UniqueName = "ExpressRoutes.ts+3+0+5+1";
const middleware2UniqueName = "ExpressRoutes.ts+6+0+8+1";
const arrowFunctionUniqueName = "ExpressRoutes.ts+12+46+12+54";

function findCallExpressionEntity(context: Context, fileName: string, functionName): CallExpressionEntity | undefined {
    return findEntity(
        context.parserState.callExpressionEntitiesByKey.values(),
        SnippetType.CallExpression,
        entity => entity.path === fileName,
        (entity: CallExpressionEntity) => entity.callExpressionFullText === functionName);
}

describe("Method declaration Features", function () {
    let testContext: Context;
    let featuresExtractor: FeaturesExtractor<IApiEntityView>;

    before(async () => {
        const [directoryPath, correlationId] = ["tests/projects/ApiResolvedParameters", "TEST"];
        testContext = new Context(correlationId, directoryPath);
        await runParserFlow(testContext);
        featuresExtractor = getApiFeaturesExtractor(directoryPath, correlationId);
    });

    describe("Resolve parameters of API declarations", function () {
        it("API with a single internal (but defined in another file) and a single external method call (handlePath)", () => {
            const entity = findCallExpressionEntity(testContext, fileName, "app.get");
            expect(entity).to.not.be.undefined;
            // @ts-ignore
            const features = getFeaturesMap(entity, ApiEntityViewFactory, featuresExtractor, testContext);
            const internalReferencedMethods = features.get(internalReferencedMethodsFeatureName) as string[];
            const externalReferencedMethods = features.get(externalReferencedMethodsFeatureName) as string[];
            expect(internalReferencedMethods).to.deep.equal([authorizedForUniqueName]);
            expect(externalReferencedMethods).to.deep.equal(["handlePath"]);

        });

        it("API with a list of middlewares", () => {
            const entity = findCallExpressionEntity(testContext, fileName, "app.post");
            expect(entity).to.not.be.undefined;
            // @ts-ignore
            const features = getFeaturesMap(entity, ApiEntityViewFactory, featuresExtractor, testContext);
            const internalReferencedMethods = features.get(internalReferencedMethodsFeatureName) as string[];
            const externalReferencedMethods = features.get(externalReferencedMethodsFeatureName) as string[];
            expect(internalReferencedMethods).to.deep.equal([middleware1UniqueName, middleware2UniqueName, arrowFunctionUniqueName]);
            expect(externalReferencedMethods).to.deep.equal(["handlePath"]);
        });

    });
});
