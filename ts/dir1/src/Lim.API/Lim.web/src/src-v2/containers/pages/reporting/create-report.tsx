import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { DefaultErrorFallback } from '@src-v2/components/async-boundary';
import { Page } from '@src-v2/components/layout/page';
import {
  CenteredMessage,
  ReportsFrame,
} from '@src-v2/containers/pages/reporting/components/reporting-common-components';
import { useMetabaseLoadingState } from '@src-v2/containers/pages/reporting/hooks/use-metabse-loading-state';
import { useInject } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';

export default function CreateReport() {
  const { reporting } = useInject();
  const [state, setState] = useMetabaseLoadingState(reporting.getMetabaseCustomOptionsIframeUrl);
  useBreadcrumbs({
    breadcrumbs: [{ label: 'Overview', to: '/reporting' }],
  });

  return (
    <Page title="Reports">
      {state.pageLoading && (
        <CenteredMessage>
          <LogoSpinner />
        </CenteredMessage>
      )}
      {state.error && <CenteredMessage>{state.error}</CenteredMessage>}
      {state.iframeUrl && (
        <ReportsFrame
          onError={() => setState(prev => ({ ...prev, error: <DefaultErrorFallback /> }))}
          onLoad={() => setState(prevState => ({ ...prevState, loading: false }))}
          src={state.iframeUrl}
        />
      )}
    </Page>
  );
}
