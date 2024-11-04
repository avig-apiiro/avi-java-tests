import { History, Location } from 'history';
import { ComponentType, ExoticComponent, ReactNode } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router-dom';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

type CustomRouteProps = {
  history: History<unknown>;
  location: Location<unknown>;
  staticContext?: StaticContext;
};

type CustomComponent = ComponentType<CustomRouteProps, any>;

type NestedRoute = {
  path: string;
  component: ComponentType;
  featureFlag?: FeatureFlag;
};

export type RouteProps = {
  path: string | string[];
  component?: CustomComponent;
  publicRoute?: boolean;
  layout?: ComponentType | ExoticComponent<any, any>;
  render?: (
    props: RouteComponentProps<{ [x: string]: string }, StaticContext, unknown>
  ) => ReactNode;
  routes?: NestedRoute[];
  featureFlag?: FeatureFlag;
  fallbackComponent?: CustomComponent;
  exact?: boolean;
  location?: Location;
};
