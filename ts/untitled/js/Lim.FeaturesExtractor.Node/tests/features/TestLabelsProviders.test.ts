import {expect} from "chai";
import 'mocha';
import {
    TestDirectoryProvider,
    TestSuffixProvider
} from "../../src/features/providers/labelsProviders/TestLabelsProviders";
import {LimLogger} from "../../src/internals/Logger";
import {CallExpressionEntity} from "../../src/models/entities/CallLikeEntities";
import {EntityKey} from "../../src/models/entities/EntityKey";
import {ModuleEntity} from "../../src/models/entities/ModuleEntity";
import {ApiEntityViewCallExpression} from "../../src/models/entityViews/ApiEntityViewCallExpression";

const logger = new LimLogger("TEST");
describe('Verify test labels', () => {

    const tests = [
        {
            entityPath: "x/y/foo.spec.ts",
            provider: TestSuffixProvider,
            expected: true
        },
        {
            entityPath: "x/y/foo.ts",
            provider: TestSuffixProvider,
            expected: false
        },
        {
            entityPath: "x/__tests__/foo.ts",
            provider: TestDirectoryProvider,
            expected: true
        },
        {
            entityPath: "x/testsfoo/foo.spec.ts",
            provider: TestDirectoryProvider,
            expected: false
        },
    ];

    tests.forEach(test => {
        it(`Check expected test label ${test.expected}`, () => {
            const provider = new test.provider();
            const entity = new CallExpressionEntity(new EntityKey(test.entityPath, {line: 0, character: 0}, {
                line: 0,
                character: 0
            }, 0));
            const input = {
                dirname: "dirname",
                entityView: new ApiEntityViewCallExpression(entity),
                entityContext: {classEntity: undefined, moduleEntity: new ModuleEntity("")},
                logger: logger
            };
            expect(provider.getValue(input)).to.equal(test.expected);

        });
    });
});

