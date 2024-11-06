import _ from 'lodash';
import { ReactNode, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { PageSpinner } from '@src-v2/components/layout/custom-layouts';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

interface PageProps {
  title?: string;
  children: ReactNode;
}

export function Page({ title, children }: PageProps) {
  useFirstTimeCheck();
  return (
    <AsyncBoundary pendingFallback={<PageSpinner />}>
      {title && <Helmet title={title} />}
      {children}
    </AsyncBoundary>
  );
}

const useFirstTimeCheck = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  const { application } = useInject();

  const allowedRoute = useMemo(
    () => allowedRoutesWhenNoSCM.find(path => pathname.includes(path)),
    [pathname]
  );

  useEffect(() => {
    if (
      application.isFeatureEnabled(FeatureFlag.EmptyStates) &&
      !_.isNil(application.integrations)
    ) {
      if (
        application.integrations.connectedToScm &&
        application.integrations.hasMonitoredRepositories &&
        (pathname === '/connect-scm' || pathname === '/monitor-repositories')
      ) {
        history.push('/');
      } else if (!allowedRoute) {
        if (!application.integrations.connectedToScm) {
          history.push('/connect-scm');
        } else if (!application.integrations.hasMonitoredRepositories) {
          history.push('/monitor-repositories');
        }
      }
    }
  }, [pathname, application.integrations]);
};

const allowedRoutesWhenNoSCM = ['/monitor-repositories', '/settings', '/connectors'];
