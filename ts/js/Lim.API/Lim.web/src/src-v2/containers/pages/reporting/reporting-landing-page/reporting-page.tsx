import React, { useMemo } from 'react';
import styled from 'styled-components';
import NoResultsFlashlight from '@src-v2/assets/images/empty-state/no-results-flashlight.svg';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Card } from '@src-v2/components/cards';
import { Page } from '@src-v2/components/layout/page';
import { CustomReportsTable } from '@src-v2/containers/pages/reporting/components/custom-reports-table';
import { ReportingPageHeader } from '@src-v2/containers/pages/reporting/reporting-landing-page/landing-page-header';
import { ReportTile } from '@src-v2/containers/pages/reporting/reporting-landing-page/reporting-tile';
import { reportsPreviewData } from '@src-v2/containers/pages/reporting/reporting-landing-page/reports-preview-data';
import { ReportPreviewData } from '@src-v2/containers/pages/reporting/reporting-landing-page/types';
import { useReportingCardsGrid } from '@src-v2/containers/pages/reporting/reporting-landing-page/use-reporting-cards-grid';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

interface CardsContainerProps {
  cards: ReportPreviewData[];
}

const CardsContainer: React.FC<CardsContainerProps> = ({ cards }) => {
  const { application } = useInject();

  const filteredCards = useMemo(
    () =>
      cards.filter(
        card => !card.featureFlag || application.isFeatureEnabled(FeatureFlag[card.featureFlag])
      ),
    [cards, application]
  );

  const { isExpanded, visibleCards, cardsPerRow, containerRef, handleSearchChange, toggleExpand } =
    useReportingCardsGrid(filteredCards);

  return (
    <>
      <ReportingTilesContainer ref={containerRef}>
        <ReportingPageHeader
          totalReports={filteredCards.length}
          visibleReports={visibleCards.length}
          onSearchTermChange={handleSearchChange}
          isExpanded={isExpanded}
          onExpandToggle={toggleExpand}
        />
        {filteredCards.length === 0 && (
          <NoResults>
            <NoResultsFlashlight />
          </NoResults>
        )}
        <CardsGrid style={{ '--cards-per-row': cardsPerRow } as React.CSSProperties}>
          {visibleCards.map(card => (
            <ReportTile key={card.reportName} {...card} />
          ))}
        </CardsGrid>
      </ReportingTilesContainer>
      {application.isFeatureEnabled(FeatureFlag.CustomReportsV2) && (
        <AsyncBoundary>
          <CustomReportsTable />
        </AsyncBoundary>
      )}
    </>
  );
};

const ReportingPage: React.FC = () => {
  return (
    <Page>
      <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Reporting' }}>
        <CardsContainer cards={reportsPreviewData} />
      </AnalyticsLayer>
    </Page>
  );
};

const ReportingTilesContainer = styled(Card)`
  width: calc(100% - 18rem);
  margin-top: 4rem;
  margin-left: 10rem;
  max-height: 200rem;
  overflow: scroll;
  padding-right: 2rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CardsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4rem;
`;

const NoResults = styled(props => (
  <div {...props}>
    <NoResultsFlashlight />
    No results found
  </div>
))`
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ReportingPage;
