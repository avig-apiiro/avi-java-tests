import React, { ElementRef, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { DefaultErrorFallback } from '@src-v2/components/async-boundary';
import { Page } from '@src-v2/components/layout/page';
import {
  ReportingDashboardHeader,
  getDashboardHeaderContent,
} from '@src-v2/containers/pages/reporting/components/reporting-dashboard-header';
import { useReportingReady } from '@src-v2/containers/pages/reporting/hooks/use-measure-reporting-performance';
import { useMetabaseLoadingState } from '@src-v2/containers/pages/reporting/hooks/use-metabse-loading-state';
import { useRenderReportingPdf } from '@src-v2/containers/pages/reporting/hooks/use-render-reporting-pdf';
import { useUpdateIframeQueryParamsFromReferer } from '@src-v2/containers/pages/reporting/hooks/use-update-iframe-query-params-from-referer';
import { useInject } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { useShareLinkModal } from '@src-v2/hooks/use-share-link-modal';

export default function ReportingDashboardPage() {
  const { reporting } = useInject();
  const path = useParams<{ dashboard: string }>();
  const trackAnalytics = useTrackAnalytics();
  const iframeRef = useRef<ElementRef<'iframe'>>();

  const [state, setState] = useMetabaseLoadingState(
    async () => await reporting.getMetabaseDashboardIframeUrl(path.dashboard)
  );

  useBreadcrumbs({
    breadcrumbs: [
      { label: 'Overview', to: '/reporting' },
      {
        label: getDashboardHeaderContent(path.dashboard)?.title,
        to: `/reporting/${path.dashboard}`,
      },
    ],
  });

  const onDashboardReady = useCallback(timeToLoad => {
    setState(prevState => ({ ...prevState, ready: true }));
    trackAnalytics(AnalyticsEventName.Loaded, {
      [AnalyticsDataField.PageName]: `Reporting Dashboard`,
      [AnalyticsDataField.DashboardName]: path.dashboard,
      [AnalyticsDataField.TimeToLoad]: timeToLoad,
    });
  }, []);

  useReportingReady(iframeRef, state.pageLoading, onDashboardReady);

  const { isDownloadingPdf, handleDownloadPdf } = useRenderReportingPdf(iframeRef);
  const { showShareModal, shareLinkModalElement } = useShareLinkModal();
  useUpdateIframeQueryParamsFromReferer(iframeRef);

  return (
    <Page title="Reports">
      <>
        {shareLinkModalElement}
        <ReportingDashboardHeader
          pageLoading={state.pageLoading}
          reportReady={state.ready}
          isDownloadingPdf={isDownloadingPdf}
          handleDownloadPdf={handleDownloadPdf}
          handleShareLink={() => showShareModal(makeReportingSharedUrl(iframeRef))}
        />

        {state.pageLoading && (
          <Centered>
            <LogoSpinner />
          </Centered>
        )}
        {state.error && <Centered>{state.error}</Centered>}
        {state.iframeUrl && (
          <ReportsFrame
            ref={iframeRef}
            onError={() => setState(prev => ({ ...prev, error: <DefaultErrorFallback /> }))}
            onLoad={() => setState(prevState => ({ ...prevState, loading: false }))}
            src={state.iframeUrl}
          />
        )}
      </>
    </Page>
  );
}

const ReportsFrame = styled.iframe`
  width: 100%;
  height: calc(100vh - var(--top-bar-height) - 0.5rem);
`;

const Centered = styled.div`
  width: 100%;
  height: calc(100vh - var(--top-bar-height));
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const makeReportingSharedUrl = (iframeRef: React.MutableRefObject<HTMLIFrameElement>) => {
  const { href } = window.location;
  const reportingUrlComponent = iframeRef?.current.contentDocument.location.search;
  const hash = iframeRef?.current.contentDocument.location.hash;
  return href + reportingUrlComponent + hash;
};
