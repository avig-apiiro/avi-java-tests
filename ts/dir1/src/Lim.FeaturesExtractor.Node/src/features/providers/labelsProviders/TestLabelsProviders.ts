import _ from "lodash";
import path from "path";
import {IApiEntityView} from "../../../models/entityViews/IApiEntityView";
import {FeatureProviderInput} from "../../types/FeatureProviderInput";
import {FeatureEntityType, FeatureProvider, Label} from "../ProviderBase";

const TestLabel = (name) => Label(`TestLabel`, name);

export const testSuffixes = [".unit.ts", ".unit.js", ".spec.ts", ".spec.js", ".test.ts", ".test.js"];
const testDirectories = ["__tests__", "tests"];

@FeatureEntityType()
class TestLabelProvider extends FeatureProvider<IApiEntityView> {
}

@TestLabel("TestSuffix")
export class TestSuffixProvider extends TestLabelProvider {
    getValue = (input: FeatureProviderInput<IApiEntityView>): boolean =>
        testSuffixes.some(suffix => input.entityView.entity.path.endsWith(suffix));
}

@TestLabel("TestDirectory")
export class TestDirectoryProvider extends TestLabelProvider {
    getValue(input: FeatureProviderInput<IApiEntityView>): boolean {
        const splitPath = input.entityView.entity.path.split(path.sep);
        return _.intersection(testDirectories, splitPath).length > 0;
    }
}

export const TestLabelsProviders = [
    TestSuffixProvider,
    TestDirectoryProvider
];
