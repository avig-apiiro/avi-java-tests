import { EventHandlerParams } from '@visx/xychart/lib/types';
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
import { RisksStatusOverTimeResponse } from '@src-v2/types/overview/overview-responses';
import { humanize } from '@src-v2/utils/string-utils';
import { entries } from '@src-v2/utils/ts-utils';

export function RisksStatusLineTile() {
  return (
    <OverviewTile title="Discovered vs. closed risks">
      <PlainRisksStatusLineTile dataFetcher={useInject().overview.getRisksStatus} />
    </OverviewTile>
  );
}

export function SecretsRisksStatusLineTile() {
  return (
    <OverviewTile title="Discovered vs. closed secret risks">
      <PlainRisksStatusLineTile
        dataFetcher={useInject().secretsOverview.getRisksStatus}
        to="secrets"
      />
    </OverviewTile>
  );
}

export function ApiRisksStatusLineTile() {
  return (
    <OverviewTile title="Discovered vs. closed API risks">
      <PlainRisksStatusLineTile
        dataFetcher={useInject().apiSecurityOverview.getRisksStatus}
        to="api"
      />
    </OverviewTile>
  );
}

export function SupplyChainRisksStatusLineTile() {
  return (
    <OverviewTile title="Discovered vs. closed supply chain risks">
      <PlainRisksStatusLineTile
        dataFetcher={useInject().supplyChainOverview.getRisksStatus}
        to="supplyChain"
      />
    </OverviewTile>
  );
}

export function OssRisksStatusLineTile() {
  return (
    <OverviewTile title="Discovered vs. closed OSS risks">
      <PlainRisksStatusLineTile dataFetcher={useInject().ossOverview.getRisksStatus} to="oss" />
    </OverviewTile>
  );
}

export function SastRisksStatusLineTile() {
  return (
    <OverviewTile title="Discovered vs. closed SAST risks">
      <PlainRisksStatusLineTile dataFetcher={useInject().sastOverview.getRisksStatus} to="sast" />
    </OverviewTile>
  );
}

function PlainRisksStatusLineTile({
  dataFetcher,
  to,
}: {
  dataFetcher: (args: { filters }) => Promise<RisksStatusOverTimeResponse>;
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
          baseUrl: to ? `/risks/${to}` : undefined,
          query: {
            Discovered: [startOfDay, endOfDay],
          },
        })
      );
    },
    [history, activeFilters, to]
  );

  return (
    <OverviewStateBoundary isRisksTile isEmpty={isLineSeriesEmpty(risksStatus)}>
      <ChartProvider
        dataKeyToStyle={{ closedRisks: { strokeDasharray: '3 5' } }}
        labelFormat={formatLabel}
        xScale={{ type: 'time', nice: true }}
        yScale={{ type: 'linear', nice: true }}
        theme={{
          colors: ['var(--color-red-50)', 'var(--color-green-50)'],
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

function formatLabel(dataKey: keyof RisksStatusOverTimeResponse) {
  switch (dataKey) {
    case 'detectedRisks':
      return 'Discovered';
    case 'closedRisks':
      return 'Closed';
    default:
      return humanize(dataKey);
  }
}
