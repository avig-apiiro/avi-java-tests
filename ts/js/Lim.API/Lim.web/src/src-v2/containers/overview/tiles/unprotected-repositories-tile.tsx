import _ from 'lodash';
import { useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { ChartProvider } from '@src-v2/components/charts';
import { DoughnutChart } from '@src-v2/components/charts/doughnut-chart/doughnut-chart';
import { ChartLegend, LegendCircle } from '@src-v2/components/charts/legends';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { getCoverageOverviewFilters } from '@src-v2/containers/overview/tiles/utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { makeUrl } from '@src-v2/utils/history-utils';
import { humanize } from '@src-v2/utils/string-utils';
import { history } from '@src/store';

const colorMap = {
  Monitored: 'var(--color-blue-65)',
  Unmonitored: 'var(--color-red-50)',
};

const getArcColor = (category: string) => {
  return colorMap[category];
};

export const UnprotectedRepositoriesTile = () => (
  <OverviewTile title="Unprotected repositories">
    <PlainUnprotectedRepositoriesTile />
  </OverviewTile>
);

function PlainUnprotectedRepositoriesTile() {
  const { coverage } = useInject();
  const { activeFilters } = useOverviewFilters();
  const [{ count: monitoredCount }, { count: unmonitoredCount }] = useSuspense([
    [
      coverage.searchCoverage,
      {
        filters: {
          RepositoryMonitorStatus: { values: ['Monitored'] },
          ...getCoverageOverviewFilters(activeFilters),
        },
      },
    ] as const,
    [
      coverage.searchCoverage,
      {
        filters: {
          RepositoryMonitorStatus: { values: ['NotMonitored'] },
          ...getCoverageOverviewFilters(activeFilters),
        },
      },
    ] as const,
  ]);

  const monitoringStatus = [
    {
      key: 'Monitored',
      count: monitoredCount,
    },
    { key: 'Unmonitored', count: unmonitoredCount },
  ];

  const trackAnalytics = useTrackAnalytics();
  const dataLabels = {
    Unmonitored: 'Unprotected repositories',
    Monitored: 'Protected repositories',
  };

  const handleClick = useCallback(status => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Tile click',
      [AnalyticsDataField.TileName]: 'Unprotected repositories',
    });
    history.push(
      makeUrl('/coverage', {
        fl: {
          RepositoryMonitorStatus: {
            values: [status === 'Monitored' ? 'Monitored' : 'NotMonitored'],
          },
          ...getCoverageOverviewFilters(activeFilters),
        },
      })
    );
  }, []);

  return (
    <OverviewStateBoundary>
      <ChartProvider
        theme={{ colors: Object.values(colorMap).reverse() }}
        xScale={{ type: 'linear' }}
        yScale={{ type: 'linear' }}>
        <DoughnutChart
          dataLabels={dataLabels}
          data={monitoringStatus}
          onClick={handleClick}
          getArcColor={getArcColor}
        />
        <RepositoriesChartLegend>
          {[...monitoringStatus].reverse().map(({ key }) => (
            <CircleContainer key={key}>
              <LegendCircle category={key} />
              {humanize(key)}
            </CircleContainer>
          ))}
        </RepositoriesChartLegend>
      </ChartProvider>
    </OverviewStateBoundary>
  );
}

const RepositoriesChartLegend = styled(ChartLegend)`
  margin-top: 2rem;
`;

const CircleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 0;
`;
