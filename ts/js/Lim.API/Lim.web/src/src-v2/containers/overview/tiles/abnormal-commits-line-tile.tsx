import { format } from 'date-fns';
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
import { isLineSeriesEmpty } from '@src-v2/containers/overview/tiles/utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { AbnormalCommitsOverTimeResponse } from '@src-v2/types/overview/supply-chain-overview-responses';
import { makeUrl } from '@src-v2/utils/history-utils';
import { entries } from '@src-v2/utils/ts-utils';

export function AbnormalCommitsLineTile() {
  return (
    <OverviewTile title="Abnormal commits">
      <PlainSupplyChainAbnormalCommitsLineTile
        dataFetcher={useInject().supplyChainOverview.getAbnormalCommitsOverTime}
      />
    </OverviewTile>
  );
}

function PlainSupplyChainAbnormalCommitsLineTile({
  dataFetcher,
}: {
  dataFetcher: (args: { filters }) => Promise<AbnormalCommitsOverTimeResponse>;
}) {
  const { overview } = useInject();
  const history = useHistory();
  const trackAnalytics = useTrackAnalytics();

  const { activeFilters: filters = {} } = useOverviewFilters();
  const [abnormalCommits, moduleBasedAppExist] = useSuspense([
    [dataFetcher, { filters }] as const,
    [overview.moduleBasedAppExist, { filters }] as const,
  ]);

  const handleClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Tile click',
    });

    const url = makeUrl('/profiles/repositories', {
      fl: { Labels: { values: ['Abnormal commit behavior detected'] } },
    });
    history.push(url);
  }, [history]);

  return (
    <OverviewStateBoundary
      noCTA
      isDisabled={moduleBasedAppExist}
      isEmpty={isLineSeriesEmpty(abnormalCommits)}>
      <ChartProvider
        xScale={{ type: 'time', nice: true }}
        yScale={{ type: 'linear', nice: true }}
        theme={{
          colors: ['var(--color-red-55)'],
        }}
        labelFormat={formatLabel}>
        <Chart onClick={handleClick}>
          <XAxis numTicks={4} tickFormat={tick => format(tick, 'd/M')} />
          <YAxis numTicks={4} />

          {entries(abnormalCommits).map(([dataKey, series]) => (
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

function formatLabel(label: keyof AbnormalCommitsOverTimeResponse) {
  switch (label) {
    case 'abnormalCommitsOverTime':
      return 'Abnormal commits';
    default:
      throw new Error(`${label} was not found`);
  }
}
