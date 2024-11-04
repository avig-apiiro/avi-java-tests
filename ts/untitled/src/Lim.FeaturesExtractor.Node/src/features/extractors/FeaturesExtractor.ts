import {LimLogger} from "../../internals/Logger";
import {IEntityView} from "../../models/entityViews/IEntityView";
import {FeaturesProvider, FeatureValue} from "../providers/ProviderBase";
import {FeaturesEntityContext} from "../types/EntityContext";

export class FeaturesExtractor<TEntityView extends IEntityView> {
    constructor(
        readonly dirname: string,
        readonly correlationId: string,
        readonly providers: FeaturesProvider<TEntityView>[]) {
    }

    get featureNames(): string[] {
        return this.providers.flatMap(provider => provider.getFeaturesNames());
    }

    getFeaturesValues(entityView: TEntityView, entityContext: FeaturesEntityContext): FeatureValue[] {
        const input = {
            dirname: this.dirname,
            entityView: entityView,
            entityContext: entityContext,
            logger: new LimLogger(this.correlationId, __filename)
        };

        return this.providers.flatMap(provider => provider.getFeatureValues(input));
    }
}
