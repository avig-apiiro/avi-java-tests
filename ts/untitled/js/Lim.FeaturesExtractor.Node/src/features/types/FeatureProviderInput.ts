import {LimLogger} from "../../internals/Logger";
import {IEntityView} from "../../models/entityViews/IEntityView";
import {FeaturesEntityContext} from "./EntityContext";

export interface FeatureProviderInput<TEntityView extends IEntityView> {
    logger: LimLogger;
    dirname: string;

    entityView: TEntityView;
    entityContext: FeaturesEntityContext;
}
