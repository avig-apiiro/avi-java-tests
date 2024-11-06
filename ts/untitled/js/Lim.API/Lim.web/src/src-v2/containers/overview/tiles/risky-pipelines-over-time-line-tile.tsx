import { EventHandlerParams } from '@visx/xychart/lib/types/series';
import { addSeconds, format } from 'date-fns';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Chart, ChartProvider, Line, XAxis, YAxis } from '@src-v2/components/charts';
import { ChartLegend, LineLegendItem } from '@src-v2/components/charts/legends';
import { ChartTooltip, LineDatumIndicator } from '@src-v2/components/charts/tooltips';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { isLineSeriesEmpty, useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { OverviewLineItem } from '@src-v2/types/overview/overview-line-item';
import { RiskyPipelinesOverTimeResponse } from '@src-v2/types/overview/supply-chain-overview-responses';
import { humanize } from '@src-v2/utils/string-utils';
import { entries } from '@src-v2/utils/ts-utils';

export function SupplyChainRiskyPipelinesLineTile() {
  return (
    <OverviewTile title="Risky pipelines discovered">
      <PlainSupplyChainRiskyPipelinesLineTile
        dataFetcher={useInject().supplyChainOverview.getRiskyPipelinesOverTime}
      />
    </OverviewTile>
  );
}

function PlainSupplyChainRiskyPipelinesLineTile({
  dataFetcher,
}: {
  dataFetcher: (args: { filters }) => Promise<RiskyPipelinesOverTimeResponse>;
  to?: string;
}) {
  const history = useHistory();
  const trackAnalytics = useTrackAnalytics();

  const makeOverviewUrl = useMakeOverviewUrl();
  const { activeFilters = {} } = useOverviewFilters();

  const risksStatus = useSuspense(dataFetcher, { filters: activeFilters });

  const handleClick = useCallback(
    ({ datum: { date } }: EventHandlerParams<OverviewLineItem>) => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Tile click',
      });

      const startOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const endOfDay = addSeconds(
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1)),
        -1
      );

      history.push(
        makeOverviewUrl({
          baseUrl: '/risks/supplyChain',
          query: {
            Discovered: [startOfDay, endOfDay],
            RiskCategory: ['PipelineMisconfigurations', 'PipelineDependencies'],
          },
        })
      );
    },
    [history, activeFilters, 'supplyChain']
  );

  return (
    <OverviewStateBoundary isRisksTile isEmpty={isLineSeriesEmpty(risksStatus)}>
      <ChartProvider
        dataKeyToStyle={{ closedRisks: { strokeDasharray: '3 5' } }}
        labelFormat={formatLabel}
        xScale={{ type: 'time', nice: true }}
        yScale={{ type: 'linear', nice: true }}
        theme={{
          colors: ['var(--color-red-50)', 'var(--color-yellow-50)'],
        }}>
        <Chart onClick={handleClick}>
          <XAxis numTicks={4} tickFormat={tick => format(tick, 'd/M')} />
          <YAxis numTicks={4} />

          {entries(risksStatus).map(([dataKey, series]) => (
            <Line
              key={dataKey}
              dataKey={dataKey}
              data={series}
              xAccessor={d => d?.date}
              yAccessor={d => d?.count}
            />
          ))}
          <ChartTooltip datumIndicator={LineDatumIndicator} />
        </Chart>
        <ChartLegend item={LineLegendItem} />
      </ChartProvider>
    </OverviewStateBoundary>
  );
}

function formatLabel(dataKey: keyof RiskyPipelinesOverTimeResponse) {
  switch (dataKey) {
    case 'misconfiguredPipelinesOverTime':
      return 'Misconfigured Pipelines';
    case 'vulnerablePipelinesOverTime':
      return 'Vulnerable Pipelines';
    default:
      return humanize(dataKey);
  }
}
