import { format } from 'date-fns';
import styled from 'styled-components';
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
import { ManualActionsOverTimeResponse } from '@src-v2/types/overview/overview-responses';
import { entries } from '@src-v2/utils/ts-utils';

export function ManualRemediationActionLinesTile() {
  return (
    <OverviewTile title="Manual actions taken">
      <PlainActionsTile dataFetcher={useInject().overview.getManualRemediationActions} />
    </OverviewTile>
  );
}

export function SecretsManualRemediationActionLinesTile() {
  return (
    <OverviewTile title="Manual actions taken">
      <PlainActionsTile dataFetcher={useInject().secretsOverview.getManualRemediationActions} />
    </OverviewTile>
  );
}

export function ApiManualRemediationActionLinesTile() {
  return (
    <OverviewTile title="Manual actions taken">
      <PlainActionsTile dataFetcher={useInject().apiSecurityOverview.getManualRemediationActions} />
    </OverviewTile>
  );
}

export function SupplyChainManualRemediationActionLinesTile() {
  return (
    <OverviewTile title="Manual actions taken">
      <PlainActionsTile dataFetcher={useInject().supplyChainOverview.getManualRemediationActions} />
    </OverviewTile>
  );
}

export function SastManualRemediationActionLinesTile() {
  return (
    <OverviewTile title="Manual actions taken">
      <PlainActionsTile dataFetcher={useInject().sastOverview.getManualRemediationActions} />
    </OverviewTile>
  );
}

export function OssManualRemediationActionLinesTile() {
  return (
    <OverviewTile title="Manual actions taken">
      <PlainActionsTile dataFetcher={useInject().ossOverview.getManualRemediationActions} />
    </OverviewTile>
  );
}

function PlainActionsTile({
  dataFetcher,
}: {
  dataFetcher: (args: { filters }) => Promise<ManualActionsOverTimeResponse>;
}) {
  const { overview, connectors, application } = useInject();

  const { activeFilters: filters = {} } = useOverviewFilters();
  const [actions, moduleBasedAppExist, providerTypes] = useSuspense([
    [dataFetcher, { filters }] as const,
    [overview.moduleBasedAppExist, { filters }] as const,
    [connectors.getProviderTypes] as const,
  ]);

  const relevantProviderGroups = providerTypes
    .filter(({ key }) => key === 'TicketingSystems' || key === 'Communication')
    .flatMap(item => item.providerGroups);

  const noData = relevantProviderGroups.every(provider => !provider.connected);
  const isEmptyState = application.isFeatureEnabled(FeatureFlag.EmptyStates);

  return (
    <OverviewStateBoundary
      noCTA
      isDisabled={moduleBasedAppExist}
      isEmpty={isLineSeriesEmpty(actions)}
      customEmptyStateCTA={Actions}
      noData={isEmptyState ? noData : undefined}>
      <ChartProvider
        xScale={{ type: 'time', nice: true }}
        yScale={{ type: 'linear', nice: true }}
        theme={{
          colors: ['var(--color-yellow-35)', 'var(--color-blue-55)'],
        }}
        labelFormat={formatLabel}>
        <Chart>
          <XAxis numTicks={4} tickFormat={tick => format(tick, 'd/M')} />
          <YAxis numTicks={4} />
          {entries(actions).map(([dataKey, series]) => (
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

function formatLabel(label: string) {
  switch (label) {
    case 'triggerMessages':
      return 'Messages';
    case 'triggerIssues':
      return 'Tickets';
    default:
      return label;
  }
}

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const Actions = (
  <ActionsContainer>
    <Button
      to="/connectors/connect/TicketingSystems"
      variant={Variant.SECONDARY}
      endIcon="Arrow"
      size={Size.LARGE}>
      Add ticketing system
    </Button>
    <Button
      to="/connectors/connect/Communication"
      variant={Variant.SECONDARY}
      endIcon="Arrow"
      size={Size.LARGE}>
      Add communication system
    </Button>
  </ActionsContainer>
);
