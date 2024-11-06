import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import 'mocha';
import {SnippetType} from "../../../src/models/entities/SnippetEntity";
import {Context} from "../../../src/types/Context";
import {FeaturesExtractor} from "../../../src/features/extractors/FeaturesExtractor";
import {findEntity, getFeaturesMap, runParserFlow} from "../integrationTestUtils";
import {FunctionLikeEntity} from "../../../src/models/entities/FunctionLikeEntity";
import {MethodEntityViewFunctionLike} from "../../../src/models/entityViews/MethodEntityViewFunctionLike";
import {MethodEntityViewFactory} from "../../../src/models/entityViews/MethodEntityViewFactory";
import {getMethodFeaturesExtractor} from "../../../src/features/extractors/MethodFeaturesExtractor";

chai.use(chaiArrays);

const externalMethodCallsFeatureName = "ExternalMethodCalls";
const internalMethodCallsFeatureName = "InternalMethodCalls";


const adderConstructorUniqueName = "Adder.ts+3+4+5+5";
const adderAddUniqueName = "Adder.ts+7+4+9+5";
const authorizedForUniqueName = "MethodCallsExample.ts+2+0+4+1";


function findMethodEntity(context: Context, fileName: string, functionName): FunctionLikeEntity | undefined {
    const entity = findEntity(
        context.parserState.functionLikeEntitiesByKey.values(),
        SnippetType.FunctionDeclaration,
        entity => entity.path === fileName,
        (entity: FunctionLikeEntity) => entity.functionName === functionName);
    expect(entity).to.not.be.undefined;
    return entity;
}

describe("Method declaration Features", function () {
    let testContext: Context;
    let featuresExtractor: FeaturesExtractor<MethodEntityViewFunctionLike>;

    before(async () => {
        const [directoryPath, correlationId] = ["tests/projects/MethodCallExamples", "TEST"];
        testContext = new Context(correlationId, directoryPath);
        await runParserFlow(testContext);
        featuresExtractor = getMethodFeaturesExtractor(directoryPath, correlationId);
    });

    describe("Identify internal and external method calls", function () {
        it("Class methods (constructor and member method)", () => {
            const entity = findMethodEntity(testContext, "AdderMethodCalls.ts", "myMethod");
            // @ts-ignore
            const features = getFeaturesMap(entity, MethodEntityViewFactory, featuresExtractor, testContext);

            const externalMethodCalls = features.get(externalMethodCallsFeatureName) as string[];
            expect(externalMethodCalls).to.not.be.undefined;
            expect(externalMethodCalls).to.be.empty;

            const internalMethodCalls = features.get(internalMethodCallsFeatureName) as string[];
            expect(internalMethodCalls).to.not.be.undefined;
            expect(internalMethodCalls).to.deep.equal([adderConstructorUniqueName, adderAddUniqueName]);
        });

        it("External known method (console.log)", () => {
            const entity = findMethodEntity(testContext, "MethodCallsExample.ts", "handlePath");
            // @ts-ignore
            const features = getFeaturesMap(entity, MethodEntityViewFactory, featuresExtractor, testContext);
            const externalMethodCalls = features.get(externalMethodCallsFeatureName) as string[];
            expect(externalMethodCalls).to.deep.equal(["console.log"])

            const internalMethodCalls = features.get(internalMethodCallsFeatureName) as string[];
            expect(internalMethodCalls).to.not.be.undefined;
            expect(internalMethodCalls).to.be.empty;
        });

        it("External imported methods (express(), app.get) and internal method call as a parameter", () => {
            const entity = findMethodEntity(testContext, "MethodCallsExample.ts", "registerPaths");
            // @ts-ignore
            const features = getFeaturesMap(entity, MethodEntityViewFactory, featuresExtractor, testContext);
            const externalMethodCalls = features.get(externalMethodCallsFeatureName) as string[];
            expect(externalMethodCalls).to.deep.equal(["express", "app.get"]);

            const internalMethodCalls = features.get(internalMethodCallsFeatureName) as string[];
            expect(internalMethodCalls).to.deep.equal([authorizedForUniqueName]);
        });

        it("External constructor call", () => {
            const entity = findMethodEntity(testContext, "MethodCallsExample.ts", "unknownConstructor");
            // @ts-ignore
            const features = getFeaturesMap(entity, MethodEntityViewFactory, featuresExtractor, testContext);
            const internalMethodCalls = features.get(internalMethodCallsFeatureName) as string[];
            expect(internalMethodCalls).to.not.be.undefined;
            expect(internalMethodCalls).to.be.empty;

            const externalMethodCalls = features.get(externalMethodCallsFeatureName) as string[];
            expect(externalMethodCalls).to.deep.equal(["SomeClass"]);
        });

    });
});
