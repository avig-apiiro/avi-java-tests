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

const hideAddToDashboardRule = `
  #root:has(header [aria-label="badge icon"]) ~ * [data-testid="add-to-dashboard-button"],
  #root:has([id="Dashboard-Parameters-And-Cards-Container"]) [name="Pre-defined reports"],
  #root:has([id="Dashboard-Parameters-And-Cards-Container"]) input,
  [id="DataPopover"] [aria-label="Pre-defined reports"],
  [id="DataPopover"]:has([aria-label="Pre-defined reports"][aria-selected="true"]) [data-testid="select-list"],
  #DataPopover :has(> [data-testid="list-search-field"]) {
    display: none !important;
  }
`;

export default function MyOrgReports() {
  const { reporting } = useInject();
  const [state, setState] = useMetabaseLoadingState(reporting.getOrganizationReportsUrl);

  useBreadcrumbs({
    breadcrumbs: [
      { label: 'Overview', to: '/reporting' },
      {
        label: 'Reports workspace',
        to: `/reporting/myOrgReports`,
      },
    ],
  });

  const handleIframeLoad = () => {
    const iframe = document.getElementById('reportsFrame') as HTMLIFrameElement;
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      if (iframeDoc) {
        const stylesheets = iframeDoc.styleSheets;
        for (let i = 0; i < stylesheets.length; i++) {
          const stylesheet = stylesheets[i];
          try {
            if (stylesheet.cssRules) {
              stylesheet.insertRule(hideAddToDashboardRule, stylesheet.cssRules.length);
            }
          } catch (e) {
            console.warn('Could not modify stylesheet on load:', e);
          }
        }
      }
    }
    setState(prevState => ({ ...prevState, loading: false }));
  };

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
          id="reportsFrame"
          onError={() => setState(prev => ({ ...prev, error: <DefaultErrorFallback /> }))}
          onLoad={handleIframeLoad}
          src={state.iframeUrl}
        />
      )}
    </Page>
  );
}
