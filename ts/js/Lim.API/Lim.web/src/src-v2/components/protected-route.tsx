import { observer } from 'mobx-react';
import { Fragment } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { PageSpinner } from '@src-v2/components/layout';
import { useInject } from '@src-v2/hooks';
import { RouteProps } from '@src-v2/types/routes';

export const ProtectedRoute = observer(
  ({
    render,
    fallbackComponent: Fallback = () => <Redirect to="/" />,
    layout: Layout = Fragment,
    featureFlag,
    ...route
  }: RouteProps) => {
    const { application } = useInject();

    return featureFlag && !application.isFeatureEnabled(featureFlag) ? (
      <Route
        render={props => (
          <Layout>
            <AsyncBoundary pendingFallback={<PageSpinner />}>
              <Fallback {...props} />
            </AsyncBoundary>
          </Layout>
        )}
      />
    ) : (
      <Route {...route} render={render} />
    );
  }
);
