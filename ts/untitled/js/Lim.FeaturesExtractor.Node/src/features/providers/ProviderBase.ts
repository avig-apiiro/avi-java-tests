import {Constructor} from "ts-morph";
import {SnippetType} from "../../models/entities/SnippetEntity";
import {IEntityView} from "../../models/entityViews/IEntityView";
import {FeatureProviderInput} from "../types/FeatureProviderInput";

const irrelevantFeatureVal = "-1";

export class NotImplementedError extends Error {
}

function FeatureNameImpl(name: string | string[]) {
    const featuresNames = typeof name === "string" ? [name] : name;

    return function <TEntityView extends IEntityView, TProviderClass extends { new(...args: any[]): FeaturesProvider<TEntityView> }>(constructor: TProviderClass): TProviderClass {
        return class extends constructor {
            getNames(): string[] {
                return featuresNames;
            };
        };
    };
}

export const FeatureName = (name: string) => FeatureNameImpl(name);
export const FeaturesNames = (names: string[]) => FeatureNameImpl(names);
export const Label = (labelName: string, featureName: string) => FeatureNameImpl(formatLabel(labelName, featureName));

export function formatLabel(labelName: string, featureName: string) {
    return `!${labelName}!${featureName}`;
}

export function FeatureEntityType<TEntityView extends IEntityView>(
    supportedSnippetType?: SnippetType,
    supportedEntityViewType?: Function & Constructor<TEntityView> | (Function & Constructor<TEntityView>)[]
) {
    return function <TProviderClass extends Constructor<FeaturesProvider<TEntityView>>>(constructor: TProviderClass): TProviderClass {
        const predicates: ((entityView: TEntityView) => boolean)[] = [];

        if (supportedSnippetType !== undefined) {
            predicates.push(entityView => entityView.getSnippetType() === supportedSnippetType);
        }

        if (supportedEntityViewType !== undefined) {
            const supportedEntityViewTypes = Array.isArray(supportedEntityViewType) ? supportedEntityViewType : [supportedEntityViewType];
            predicates.push(entityView => supportedEntityViewTypes.some(entityViewType => entityView instanceof entityViewType));
        }

        return class extends constructor {
            appliesTo(input: FeatureProviderInput<TEntityView>) {
                return predicates.every(pred => pred(input.entityView));
            }
        };
    };
}

const defaultError = () => TypeError("Missing property. Is features provider decorated?");

export type MapFeature = { [key: string]: string }
export type FeatureValue = boolean | number | number[] | string | string[] | MapFeature

export abstract class FeaturesProvider<TEntityView extends IEntityView> {
    getFeatureValues(input: FeatureProviderInput<TEntityView>): FeatureValue[] {
        if (this.shouldProvide(input)) {
            try {
                return this.getValues(input);
            } catch (error) {
                input.logger.info(
                    `Failed to get features value for entitys. Key=${input.entityView.entity.getUid}, type=${SnippetType[input.entityView.getSnippetType()]}`
                );
                throw(error);
            }

        }

        return this.getConstFeaturesValues(irrelevantFeatureVal);
    }

    getFeaturesNames(): string[] {
        return (this["getNames"] ?? defaultError)();
    };

    protected isRelevant(input: FeatureProviderInput<TEntityView>): boolean {
        return true;
    }

    protected getValues(input: FeatureProviderInput<TEntityView>): FeatureValue[] {
        throw new NotImplementedError();
    };

    protected getConstFeaturesValues(value: string): string[] {
        return new Array(this.getFeaturesNames().length).fill(value);
    }

    private shouldProvide = (input: FeatureProviderInput<TEntityView>): boolean => {
        return (this["appliesTo"] ?? defaultError)(input) && this.isRelevant(input);
    };
}

export abstract class FeatureProvider<TEntityView extends IEntityView> extends FeaturesProvider<TEntityView> {
    getValues = (input: FeatureProviderInput<TEntityView>): FeatureValue[] => [this.getValue(input)];

    getValue(input: FeatureProviderInput<TEntityView>): FeatureValue {
        throw new NotImplementedError();
    }
}
