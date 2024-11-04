import {expect} from "chai";
import 'mocha';

import {CallExpressionFeaturesProviders} from "../../src/features/providers/featuresProviders/apiFeaturesProviders/CallExpressionFeaturesProviders";
import {CommonApiFeaturesProvider} from "../../src/features/providers/featuresProviders/apiFeaturesProviders/CommonApiFeaturesProviders";
import {CommonClassFeaturesProviders} from "../../src/features/providers/featuresProviders/commonFeaturesProviders/CommonClassFeaturesProviders";
import {CommonFeaturesProviders} from "../../src/features/providers/featuresProviders/commonFeaturesProviders/CommonFeaturesProviders";
import {ApiLabelsProviders} from "../../src/features/providers/labelsProviders/ApiLabelsProviders";
import {TestLabelsProviders} from "../../src/features/providers/labelsProviders/TestLabelsProviders";
import {LimLogger} from "../../src/internals/Logger";
import {CallExpressionEntity} from "../../src/models/entities/CallLikeEntities";
import {EntityKey} from "../../src/models/entities/EntityKey";
import {ModuleEntity} from "../../src/models/entities/ModuleEntity";
import {ApiEntityViewFactory} from "../../src/models/entityViews/ApiEntityViewFactory";
import {DataModelEntityViewFactory} from "../../src/models/entityViews/DataModelEntityViewFactory";

const logger = new LimLogger("TEST");

describe('Test features providers - names length matches values length', () => {
    const fakeKey = getFakeKey();

    const apitests = [
        {
            name: "Call Expression",
            entity: getValidCallExpressionEntity(),
            providers: CallExpressionFeaturesProviders
        },
        {
            name: "Common class features",
            entity: getValidCallExpressionEntity(),
            providers: CommonClassFeaturesProviders
        },
        {
            name: "Common API features",
            entity: getValidCallExpressionEntity(),
            providers: CommonApiFeaturesProvider
        },
        {
            name: "Common features",
            entity: getValidCallExpressionEntity(),
            providers: CommonFeaturesProviders
        },
        {
            name: "API Label",
            entity: getValidCallExpressionEntity(),
            providers: ApiLabelsProviders
        },
        {
            name: "Test Label",
            entity: getValidCallExpressionEntity(),
            providers: TestLabelsProviders
        },
    ];

    apitests.forEach(({name, entity, providers}) => {
        it(`${name} provider`, () => {
            runCase(ApiEntityViewFactory(entity, {
                classEntity: undefined,
                moduleEntity: new ModuleEntity("")
            }), providers);
        });
    });

    const dataModelTests = [];
    // @ts-ignore
    dataModelTests.forEach(({name, entity, providers}) => {
        it(`${name} provider`, () => {
            runCase(DataModelEntityViewFactory(entity, {
                classEntity: undefined,
                moduleEntity: new ModuleEntity("")
            }), providers);
        });
    });

    function runCase(entityView, providers) {
        const input = {
            entityView: entityView,
            dirname: "dirname",
            entityContext: {classEntity: undefined, moduleEntity: new ModuleEntity("")},
            logger: logger
        };
        providers.forEach(providerType => {
            const provider = new providerType();
            expect(provider.getFeaturesNames().length).to.equal(provider.getFeatureValues(input).length);
        });
    }
});

function getFakeKey() {
    return new EntityKey("", {line: 0, character: 0}, {line: 0, character: 0}, 0);
}

function getValidCallExpressionEntity(key: EntityKey | undefined = undefined){
    const entity = new CallExpressionEntity(key ?? getFakeKey());
    entity.callExpressionFullText = "foo.bar";
    entity.callExpressionIsPropertyAccess = true;
    entity.siblingsInfo = {
        // @ts-ignore
        methodCounts: undefined,
        httpMethodsCount: 4,
        appFrameworkMethodsCount: 4,
        otherMethodCount: 4
    };
    return entity;
}

function findProviderTypeByName(providers, providerName) {
    const filteredProviderTypes = providers.filter(providerType => new providerType().getFeaturesNames().includes(providerName));
    if (filteredProviderTypes.length !== 1) {
        return undefined;
    }
    return filteredProviderTypes[0];
}

describe('Test features based on EntityKey values', () => {
    const path = "dummyPath";
    const lineNumber = 55;
    const endLineNumber = 57;
    const key = new EntityKey(path, {line: lineNumber, character: 0}, {line: endLineNumber, character: 0}, 0);
    const entityView = ApiEntityViewFactory(getValidCallExpressionEntity(key), {
        classEntity: undefined,
        moduleEntity: new ModuleEntity("")
    })

    const input = {
        entityView: entityView,
        dirname: "dirname",
        entityContext: {classEntity: undefined, moduleEntity: new ModuleEntity("")},
        logger: logger
    };

    it("path feature", () => {
        const pathProviderType = findProviderTypeByName(CommonFeaturesProviders, "Path");
        const pathProvider = new pathProviderType();
        expect(pathProvider.getFeatureValues(input)).to.deep.equal([path]);
    })

    it("LineNumber feature", () => {
        const pathProviderType = findProviderTypeByName(CommonFeaturesProviders, "LineNumber");
        const pathProvider = new pathProviderType();
        expect(pathProvider.getFeatureValues(input)).to.deep.equal([lineNumber+1]);
    })

    it("EndsLineInFile feature", () => {
        const pathProviderType = findProviderTypeByName(CommonFeaturesProviders, "EndsLineInFile");
        const pathProvider = new pathProviderType();
        expect(pathProvider.getFeatureValues(input)).to.deep.equal([endLineNumber+1]);
    })

});