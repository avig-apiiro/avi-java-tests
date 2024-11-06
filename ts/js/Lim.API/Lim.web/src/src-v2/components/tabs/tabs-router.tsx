import _ from 'lodash';
import { ComponentType, ReactNode, useMemo } from 'react';
import { NavLinkProps, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useInject } from '@src-v2/hooks';
import { Application } from '@src-v2/services';

interface LinkDefinition extends Omit<NavLinkProps, 'to'> {
  key?: string;
  to: string;
}

export interface RouteDefinition
  extends Pick<LinkDefinition, 'key' | 'title' | 'exact' | 'isActive'> {
  path: string;
  order?: number;
  condition?: boolean | ((application: Application) => boolean);
  component?: ComponentType;
  render?: () => ReactNode;
}

export interface TabsRouterProps {
  routes: RouteDefinition[];
  variant?: Variant.PRIMARY | Variant.SECONDARY | Variant.TERTIARY;
  actions?: ReactNode;
  redirectPath?: string;
  noRedirect?: boolean;
  noAnimation?: boolean;
}

export function TabsRouter({
  routes,
  redirectPath,
  variant = Variant.TERTIARY,
  noRedirect,
  noAnimation,
  actions,
  ...props
}: TabsRouterProps) {
  const { application } = useInject();
  const match = useRouteMatch();

  const orderedRoutes = useMemo(() => {
    const enabledRoutes = routes.filter(
      route =>
        (typeof route.condition === 'function' ? route.condition(application) : route.condition) ??
        true
    );

    return _.orderBy(enabledRoutes, route => route.order ?? 0);
  }, [routes]);

  const links = useMemo(
    () =>
      orderedRoutes.map(route => ({
        key: route.key,
        label: route.title,
        isActive: route.isActive && ((_: any, location: any) => route.isActive(match, location)),
        exact: route.exact,
        to: route.path,
      })),
    [orderedRoutes, match]
  );

  return (
    <>
      <TabsWrapper>
        <Tabs {...props} tabs={links} variant={variant} />
        {actions}
      </TabsWrapper>
      <Switch>
        {orderedRoutes.map(route => (
          <Route
            key={route.key ?? route.title}
            path={joinPath(match.path, route.path)}
            exact={route.exact}>
            {route.render?.() ?? (route.component ? <route.component /> : null)}
          </Route>
        ))}
        {(redirectPath || !noRedirect) && orderedRoutes.length > 0 && (
          <Redirect to={joinPath(match.path, redirectPath ?? orderedRoutes[0].path)} />
        )}
      </Switch>
    </>
  );
}

function joinPath(...pathParts: string[]) {
  return pathParts[pathParts.length - 1].charAt(0) === '/'
    ? pathParts[pathParts.length - 1]
    : pathParts.filter(Boolean).join('/').replace(/\/+/g, '/');
}

const TabsWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;
