import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { ChartProvider } from '@src-v2/components/charts';
import { BarGroupChart } from '@src-v2/components/charts/grouped-bars-chart';
import {
  GroupedBarChartLegend,
  GroupedBarLegendItem,
} from '@src-v2/components/charts/legends/group-chart-legend';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { RiskStatus, getRiskyRiskLevels } from '@src-v2/types/enums/risk-level';
import { SlaBreachesResponse } from '@src-v2/types/overview/overview-responses';

export function SLATile() {
  return (
    <OverviewTile title="SLA adherence">
      <PlainSLATile />
    </OverviewTile>
  );
}

function PlainSLATile() {
  const history = useHistory();
  const { overview } = useInject();
  const { activeFilters } = useOverviewFilters();
  const slaRisksByRiskLevel = useSuspense(overview.getSLABreachesByRiskLevel, {
    filters: activeFilters,
  });

  const makeOverviewUrl = useMakeOverviewUrl();

  const handleClick = useCallback(
    data => {
      if (data.key === 'unsetDueDate') {
        return; // prevent click on slaAdherence bar until filter is supported
      }
      const riskyRiskLevels = getRiskyRiskLevels();
      const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;

      const dateRanges = {
        slaBreach: [new Date(Date.now() - twoYears), new Date()],
        slaAdherence: [new Date(), new Date(Date.now() + twoYears)],
        unsetDueDate: null,
      };

      if (dateRanges.hasOwnProperty(data.key)) {
        history.push(
          makeOverviewUrl({
            baseUrl: '/risks',
            query: {
              DueDate: dateRanges[data.key],
              RiskLevel: [riskyRiskLevels[riskyRiskLevels.length - data.barGroupIndex - 1]], //Reverse risk levels from highest to lowest.
              RiskStatus: [RiskStatus.Open],
            },
          })
        );
      }
    },
    [history]
  );

  const keys: (keyof SlaBreachesResponse[number])[] = ['slaBreach', 'slaAdherence', 'unsetDueDate'];

  const colors = {
    slaBreach: 'var(--color-red-50)',
    slaAdherence: 'var(--color-blue-55)',
    unsetDueDate: 'var(--color-blue-gray-30)',
  };

  const chartLabels = {
    slaBreach: 'SLA breaches',
    slaAdherence: 'SLA adherence',
    unsetDueDate: 'Due date not set',
  };

  return (
    <OverviewStateBoundary
      isEmpty={
        slaRisksByRiskLevel?.length === 0 ||
        slaRisksByRiskLevel.every(data => data.slaAdherence === 0 && data.slaBreach === 0)
      }>
      <ChartProvider
        xScale={{ type: 'band' }}
        yScale={{ type: 'linear', nice: true }}
        labelFormat={key => chartLabels[key]}
        theme={{
          colors: Object.values(colors),
        }}>
        <BarGroupChart
          xAccessor="riskLevel"
          data={slaRisksByRiskLevel}
          keys={keys}
          colors={colors}
          labelFormat={key => chartLabels[key]}
          onClick={handleClick}
        />
        <GroupedBarChartLegend keys={keys} item={GroupedBarLegendItem} />
      </ChartProvider>
    </OverviewStateBoundary>
  );
}
