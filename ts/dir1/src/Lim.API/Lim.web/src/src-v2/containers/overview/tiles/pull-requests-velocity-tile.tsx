import { format } from 'date-fns';
import { Button } from '@src-v2/components/button-v2';
import { Chart, ChartProvider, Line, XAxis, YAxis } from '@src-v2/components/charts';
import { ChartLegend, LineLegendItem } from '@src-v2/components/charts/legends';
import { ChartTooltip, LineDatumIndicator } from '@src-v2/components/charts/tooltips';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { isLineSeriesEmpty } from '@src-v2/containers/overview/tiles/utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { PullRequestsOverTimeResponse } from '@src-v2/types/overview/overview-responses';
import { entries } from '@src-v2/utils/ts-utils';

export function PullRequestsVelocityTile() {
  return (
    <OverviewTile title="Development velocity">
      <PlainPullRequestsVelocityTile />
    </OverviewTile>
  );
}

function PlainPullRequestsVelocityTile() {
  const { overview, application } = useInject();
  const { activeFilters: filters = {} } = useOverviewFilters();
  const [pullRequestSeries, moduleBasedAppExist, hasPRApp] = useSuspense([
    [overview.getPullRequestsOverTime, { filters }] as const,
    [overview.moduleBasedAppExist, { filters }] as const,
    [overview.hasPRAppm] as const,
  ]);
  const isEmptyState = application.isFeatureEnabled(FeatureFlag.EmptyStates);
  const customEmptyStateCTA = isEmptyState ? (
    <Button
      to="/connectors/manage/Github#SourceCode"
      variant={Variant.SECONDARY}
      endIcon="Arrow"
      size={Size.LARGE}>
      Install GitHub App
    </Button>
  ) : hasPRApp ? null : (
    <Button to="connectors/connect#source-code" variant={Variant.PRIMARY} endIcon="Arrow">
      Install SCM App
    </Button>
  );

  return (
    <OverviewStateBoundary
      isDisabled={moduleBasedAppExist}
      isEmpty={
        isEmptyState
          ? isLineSeriesEmpty(pullRequestSeries)
          : !hasPRApp || isLineSeriesEmpty(pullRequestSeries)
      }
      noData={isEmptyState ? !hasPRApp : undefined}
      customEmptyStateCTA={customEmptyStateCTA}>
      <ChartProvider
        labelFormat={formatLabels}
        dataKeyToStyle={{ prComments: { strokeDasharray: '3 5' } }}
        xScale={{ type: 'time', nice: true }}
        yScale={{ type: 'linear', nice: true }}
        theme={{
          colors: ['var(--color-blue-55)', 'var(--color-red-50)', 'var(--color-green-45)'],
        }}>
        <Chart>
          <XAxis tickFormat={tick => format(tick, 'd/M')} />
          <YAxis numTicks={4} />

          {entries(pullRequestSeries).map(([dataKey, series]) => (
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

function formatLabels(label: keyof PullRequestsOverTimeResponse) {
  switch (label) {
    case 'pullRequests':
      return 'PRs';
    case 'pullRequestsWithRisk':
      return 'Risky PRs';
    case 'pullRequestsWithAction':
      return 'PR block/comment';
    default:
      return '';
  }
}
