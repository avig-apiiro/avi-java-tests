import { TickRendererProps } from '@visx/axis';
import { Text } from '@visx/text';
import { EventHandlerParams } from '@visx/xychart/lib/types';
import _ from 'lodash';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Bars, BarsChart, ChartProvider, XAxis, YAxis } from '@src-v2/components/charts';
import { PlainChartTooltip } from '@src-v2/components/charts/tooltips/plain-chart-tooltip';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { ValidSecretsTooltipContent } from '@src-v2/containers/overview/tiles/valid-secrets-tile/valid-secrets-tooltip';
import { getVendorIconUrl, hasVendorIcon } from '@src-v2/data/icons';
import { useInject, useSuspense } from '@src-v2/hooks';
import { ProviderToValidSecrets } from '@src-v2/types/overview/secrets-overview-responses';
import { makeUrl } from '@src-v2/utils/history-utils';
import { humanize } from '@src-v2/utils/string-utils';

const colorDecrementStep = 5;

export function ValidSecretsTile() {
  return (
    <OverviewTile title="Valid secrets based on platform">
      <PlainValidSecretsTile />
    </OverviewTile>
  );
}

function PlainValidSecretsTile() {
  const history = useHistory();
  const { secretsOverview } = useInject();
  const { activeFilters } = useOverviewFilters();
  const providerToValidSecrets = useSuspense(secretsOverview.getValidSecrets, {
    filters: activeFilters,
  });
  const tableFilters = _.omit(activeFilters, 'DashboardDateRange');
  const handleClick = useCallback(
    (event: EventHandlerParams<ProviderToValidSecrets>) => {
      history.push(
        makeUrl('/risks/secrets', {
          fl: {
            Platform: event.datum.provider !== 'Other' ? { values: [event.datum.provider] } : null,
            SecretValidity: { values: ['Valid'] },
            ...tableFilters,
          },
        })
      );
    },
    [history]
  );

  const isEmpty =
    !providerToValidSecrets.length || providerToValidSecrets.every(item => !item.count);

  return (
    <OverviewStateBoundary isEmpty={isEmpty}>
      <ChartProvider
        xScale={{ type: 'band', paddingInner: 0.3, paddingOuter: 0.3 }}
        yScale={{ type: 'linear', nice: true }}>
        <BarsChart captureEvents={false}>
          <XAxis
            hideTicks
            tickComponent={ProviderTick}
            tickValues={providerToValidSecrets.map(item => item.provider)}
            labelOffset={10}
          />
          <YAxis hideZero numTicks={4} />

          <Bars
            dataKey="providers"
            data={providerToValidSecrets}
            onClick={handleClick}
            colorAccessor={(_, index) => `var(--color-blue-${70 - index * colorDecrementStep})`}
            xAccessor={d => d.provider}
            yAccessor={d => d.count}
          />

          <PlainChartTooltip<ProviderToValidSecrets>
            snapTooltipToDatumX
            snapTooltipToDatumY
            renderTooltip={ValidSecretsTooltipContent}
          />
        </BarsChart>
      </ChartProvider>
    </OverviewStateBoundary>
  );
}

function ProviderTick({ formattedValue, x, y, fontFamily, ...props }: TickRendererProps) {
  return hasVendorIcon(formattedValue) ? (
    <VendorSvgIcon href={getVendorIconUrl(formattedValue)} data-name={formattedValue} />
  ) : (
    <Text {...props}>{humanize(formattedValue)}</Text>
  );
}

const VendorSvgIcon = styled.image`
  y: -2.5rem;
  x: -2.5rem;
  width: 5rem;
  height: 5rem;
`;
