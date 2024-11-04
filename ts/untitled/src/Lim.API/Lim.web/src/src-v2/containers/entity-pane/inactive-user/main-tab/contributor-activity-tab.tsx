import { AxisScaleOutput } from '@visx/axis';
import { ScaleConfig } from '@visx/scale';
import { format } from 'date-fns';
import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { Chart, ChartProvider, Line, XAxis, YAxis } from '@src-v2/components/charts';
import { ChartLegend, LineLegendItem } from '@src-v2/components/charts/legends';
import { ChartTooltip, LineDatumIndicator } from '@src-v2/components/charts/tooltips';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { useContributorNotPushingCodeContext } from '@src-v2/containers/entity-pane/inactive-user/use-contributor-not-pushing-code-pane-context';
import { entries } from '@src-v2/utils/ts-utils';

export const ContributorActivityTab = (props: ControlledCardProps) => {
  const { element } = useContributorNotPushingCodeContext();

  const lineData = useMemo(
    () => ({
      commits: element?.contributionsThisYear ?? [],
    }),
    [element]
  );

  const maxYValue = _.max(lineData.commits.map(commit => commit.count));
  const yScaleConfig: ScaleConfig<AxisScaleOutput> = {
    type: 'linear',
    nice: true,
  };

  if (maxYValue <= 4) {
    yScaleConfig.domain = [0, 4];
  }

  return (
    <ControlledCard {...props} title="Contributor activity">
      <OverviewStateBoundary>
        <ChartProvider
          labelFormat={() => 'Commits'}
          xScale={{ type: 'time', nice: true }}
          yScale={yScaleConfig}
          theme={{
            colors: ['var(--color-blue-55)'],
          }}>
          <TileChart>
            <XAxis numTicks={4} tickFormat={tick => format(tick, 'MMM, yyyy')} />
            <YAxis numTicks={4} />

            {entries(lineData).map(([dataKey, series]) => {
              return (
                <Line
                  key={dataKey}
                  dataKey={dataKey}
                  data={series}
                  xAccessor={d => d?.date}
                  yAccessor={d => d?.count}
                />
              );
            })}
            <ChartTooltip datumIndicator={LineDatumIndicator} />
          </TileChart>
          <ChartLegend item={LineLegendItem} />
        </ChartProvider>
      </OverviewStateBoundary>
    </ControlledCard>
  );
};

const TileChart = styled(Chart)`
  min-height: 74rem;
`;
