import { AnimatedAreaSeries, AnimatedAreaStack } from '@visx/xychart';
import { format } from 'date-fns';
import { Button } from '@src-v2/components/button-v2';
import { AreaChart, ChartProvider, XAxis, YAxis } from '@src-v2/components/charts';
import { ChartLegend } from '@src-v2/components/charts/legends';
import { AreaDatumIndicator, ChartTooltip } from '@src-v2/components/charts/tooltips';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { isLineSeriesEmpty } from '@src-v2/containers/overview/tiles/utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { WorkflowActionsOverTimeResponse } from '@src-v2/types/overview/overview-responses';
import { humanize } from '@src-v2/utils/string-utils';

export function WorkflowRemediationActionsTile() {
  return (
    <OverviewTile title="Workflow actions on new risks">
      <PlainActionsTile dataFetcher={useInject().overview.getWorkflowRemediationActions} />
    </OverviewTile>
  );
}

function PlainActionsTile({
  dataFetcher,
}: {
  dataFetcher: (args: { filters }) => Promise<WorkflowActionsOverTimeResponse>;
}) {
  const { application, workflows } = useInject();
  const { activeFilters = {} } = useOverviewFilters();
  const actions = useSuspense(dataFetcher, { filters: activeFilters });
  const isEmptyState = application.isFeatureEnabled(FeatureFlag.EmptyStates);
  const searchWorkflows = useSuspense(workflows.searchWorkflows);

  const customEmptyStateCTA = isEmptyState ? (
    <Button to="/workflows/manager" variant={Variant.SECONDARY} endIcon="Arrow" size={Size.LARGE}>
      Create a workflow
    </Button>
  ) : undefined;

  return (
    <OverviewStateBoundary
      noCTA
      isEmpty={isLineSeriesEmpty(actions)}
      noData={isEmptyState ? searchWorkflows.total === 0 : undefined}
      customEmptyStateCTA={customEmptyStateCTA}>
      <ChartProvider
        xScale={{ type: 'time' }}
        yScale={{ type: 'linear', nice: true }}
        theme={{
          colors: ['var(--color-yellow-40)', 'var(--color-blue-55)', 'var(--color-green-45)'],
        }}
        labelFormat={formatLabels}>
        <AreaChart>
          <XAxis hideTicks tickFormat={tick => format(tick, 'd/M')} />
          <YAxis numTicks={4} />

          <AnimatedAreaStack renderLine={false}>
            {Object.entries(actions).map(([dataKey, series]) => (
              <AnimatedAreaSeries
                key={dataKey}
                dataKey={dataKey}
                data={series}
                xAccessor={d => d?.date}
                yAccessor={d => d?.count}
              />
            ))}
          </AnimatedAreaStack>
          <ChartTooltip showSeriesGlyphs={false} datumIndicator={AreaDatumIndicator as any} />
        </AreaChart>
        <ChartLegend item={AreaDatumIndicator as any} />
      </ChartProvider>
    </OverviewStateBoundary>
  );
}

function formatLabels(label: keyof WorkflowActionsOverTimeResponse) {
  switch (label) {
    case 'triggeredMessageActions':
      return 'Messages';
    case 'triggeredProjectActions':
      return 'Tickets';
    case 'triggeredPullRequestActions':
      return 'PR block/comment';
    default:
      return humanize(label);
  }
}
