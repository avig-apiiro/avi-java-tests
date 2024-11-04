import { observer } from 'mobx-react';
import { Fragment } from 'react';
import { Redirect, Switch, useLocation } from 'react-router-dom';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { PageSpinner } from '@src-v2/components/layout';
import { ProtectedRoute } from '@src-v2/components/protected-route';
import { useInject } from '@src-v2/hooks';
import { RouteProps } from '@src-v2/types/routes';

export const RouteFactory = observer(
  ({
    component: Component,
    publicRoute = false,
    layout: Layout = Fragment,
    routes,
    ...route
  }: RouteProps) => {
    const { session } = useInject();
    const location = useLocation();

    if (!session.connected && !publicRoute) {
      route.render = () => (
        <Redirect
          to={{
            pathname: '/login',
            search: `?returnUrl=${encodeURIComponent(location.pathname)}`,
            state: { referrer: location },
          }}
        />
      );
    } else if (Component) {
      // TODO stop passing `props` when legacy code dependency on it is removed
      route.render = props => (
        <Layout>
          <AsyncBoundary pendingFallback={<PageSpinner />}>
            <Component {...props} />
          </AsyncBoundary>
        </Layout>
      );
    } else if (routes) {
      route.render = () => (
        <Layout>
          <Switch>
            {routes.map(route => (
              <RouteFactory key={route.path ?? '*'} {...route} />
            ))}
          </Switch>
        </Layout>
      );
    }

    return <ProtectedRoute layout={Layout} {...route} />;
  }
);
