import { format } from 'date-fns';
import { Chart, ChartProvider, Line, XAxis, YAxis } from '@src-v2/components/charts';
import { ChartLegend, LineLegendItem } from '@src-v2/components/charts/legends';
import { ChartTooltip, LineDatumIndicator } from '@src-v2/components/charts/tooltips';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { isLineSeriesEmpty } from '@src-v2/containers/overview/tiles/utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { CommitsOverTimeResponse } from '@src-v2/types/overview/overview-responses';
import { humanize } from '@src-v2/utils/string-utils';
import { entries } from '@src-v2/utils/ts-utils';

export function RiskyCommitsLineTile() {
  return (
    <OverviewTile title="Risky material changes in commits">
      <TileContent />
    </OverviewTile>
  );
}

function TileContent() {
  const { overview } = useInject();
  const { activeFilters: filters = {} } = useOverviewFilters();
  const [materialChangesSeries, moduleBasedAppExist] = useSuspense([
    [
      overview.getRiskyCommitsOverTime,
      {
        filters,
      },
    ] as const,
    [overview.moduleBasedAppExist, { filters }] as const,
  ]);

  return (
    <OverviewStateBoundary
      isDisabled={moduleBasedAppExist}
      isEmpty={isLineSeriesEmpty(materialChangesSeries)}>
      <ChartProvider
        xScale={{ type: 'time', nice: true }}
        yScale={{ type: 'linear', nice: true }}
        labelFormat={formatLabels}
        theme={{
          colors: ['var(--color-blue-55)', 'var(--color-yellow-35)', 'var(--color-red-50)'],
        }}>
        <Chart>
          <XAxis tickFormat={tick => format(tick, 'd/M')} />
          <YAxis numTicks={4} />

          {entries(materialChangesSeries).map(([dataKey, series]) => (
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

function formatLabels(label: keyof CommitsOverTimeResponse) {
  switch (label) {
    case 'materialChangesOverTime':
      return 'Material changes';
    case 'riskyMaterialChangesOverTime':
      return 'Risky changes';
    case 'commits':
      return humanize(label);
    default:
      throw new Error(`${label} was not found`);
  }
}
