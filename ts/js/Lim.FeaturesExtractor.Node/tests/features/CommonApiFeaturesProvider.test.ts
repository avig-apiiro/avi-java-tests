import {expect} from "chai";
import 'mocha';
import {
    HasClientFrameworkModulesImportedProvider,
    HasHttpClientModulesImportedProvider
} from "../../src/features/providers/featuresProviders/apiFeaturesProviders/CommonApiFeaturesProviders";
import {LimLogger} from "../../src/internals/Logger";
import {EntityKey} from "../../src/models/entities/EntityKey";
import {FunctionLikeEntity} from "../../src/models/entities/FunctionLikeEntity";
import {ImportEntity} from "../../src/models/entities/ImportEntity";
import {ModuleEntity} from "../../src/models/entities/ModuleEntity";
import {ApiEntityViewFunctionLike} from "../../src/models/entityViews/ApiEntityViewFunctionLike";

const logger = new LimLogger("TEST");
describe('Test common API features', () => {
    const entityKey = new EntityKey("", {line: 0, character: 0}, {line: 0, character: 0}, 0);
    const apiCandidate = new ApiEntityViewFunctionLike(new FunctionLikeEntity(entityKey));

    const tests = [
        {
            name: "HasHttpClientModulesImportedProvider",
            provider: HasHttpClientModulesImportedProvider,
            externalModules: [`lodash`, "axios"],
            expected: true
        },
        {
            name: "HasHttpClientModulesImportedProvider",
            provider: HasHttpClientModulesImportedProvider,
            externalModules: [`lodash`],
            expected: false
        },
        {
            name: "HasClientFrameworkModulesImportedProvider",
            provider: HasClientFrameworkModulesImportedProvider,
            externalModules: [`@angular/cli`, "axios"],
            expected: true
        },
        {
            name: "HasClientFrameworkModulesImportedProvider",
            provider: HasClientFrameworkModulesImportedProvider,
            externalModules: [`lodash`],
            expected: false
        }

    ];

    tests.forEach(test => {
        it(`Check expected ${test.name} = ${test.expected}`, () => {
            const provider = new test.provider();

            const input = {
                dirname: "dirname",
                entityView: apiCandidate,
                entityContext: {classEntity: undefined, moduleEntity: new ModuleEntity("")},
                logger: logger
            };
            test.externalModules.forEach(module => input.entityContext.moduleEntity.addModuleImport(new ImportEntity(entityKey, module)));
            expect(provider.getValue(input)).to.equal(test.expected);
        });
    });
});

