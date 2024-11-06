import _ from 'lodash';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTilesGrid } from '@src-v2/components/overview/overview-tiles';
import { OverviewTilesOrderProvider } from '@src-v2/components/overview/overview-tiles-order-context';
import { ReorderTilesButton } from '@src-v2/components/overview/reorder-tiles-button';
import { useRenderDashboardPdf } from '@src-v2/containers/pages/overview/use-render-dashboard-pdf';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function BaseOverviewPage({
  title,
  filtersFetcher,
  header,
  summary,
  children,
}: {
  title: string;
  filtersFetcher: () => Promise<any[]>;
  header?: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
}) {
  const filterOptions = useSuspense(filtersFetcher);
  const { application } = useInject();
  const { isPdfReady, isDownloadingPdf, handleDownloadPdf } = useRenderDashboardPdf(title);

  return (
    <Page title={title}>
      <PageStateBoundary>
        <StickyHeader isStaticActions>{header}</StickyHeader>
        <PageBody>
          <OverviewTilesOrderProvider storagePrefix={_.kebabCase(title)}>
            {summary}
            <ActionsContainer>
              <FiltersControls filterOptions={filterOptions} />
              <TilesActionsContainer>
                <ReorderTilesButton />
                {application.isFeatureEnabled(FeatureFlag.ExportPdfDashboard) && (
                  <Button
                    startIcon="Export"
                    loading={isDownloadingPdf}
                    disabled={!isPdfReady}
                    onClick={handleDownloadPdf}>
                    Export PDF
                  </Button>
                )}
              </TilesActionsContainer>
            </ActionsContainer>
            <div data-pdf>{children}</div>
          </OverviewTilesOrderProvider>
        </PageBody>
      </PageStateBoundary>
    </Page>
  );
}

const PageStateBoundary = styled(OverviewStateBoundary)`
  height: calc(100vh - var(--top-bar-height) * 2);
  padding-bottom: 10rem;
`;

const PageBody = styled(Gutters)`
  padding-top: 6rem;
  padding-bottom: 6rem;

  ${OverviewTilesGrid} {
    padding: 6rem 0 4rem;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TilesActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 2rem;
`;
