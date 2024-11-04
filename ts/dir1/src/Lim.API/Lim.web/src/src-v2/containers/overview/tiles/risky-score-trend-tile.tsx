import { format } from 'date-fns';
import { useMemo } from 'react';
import { BadgeColors } from '@src-v2/components/badges';
import { Chart, ChartProvider, Line, XAxis, YAxis } from '@src-v2/components/charts';
import { ChartLegend, LineLegendItem } from '@src-v2/components/charts/legends';
import { ChartTooltip, LineDatumIndicator } from '@src-v2/components/charts/tooltips';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { useInject, useSuspense } from '@src-v2/hooks';
import { abbreviate } from '@src-v2/utils/number-utils';

export function RiskScoreTrendTile() {
  const { overview } = useInject();
  const { activeFilters: filters = {} } = useOverviewFilters();
  const riskScoreResults = useSuspense(overview.getRiskScoreTrend, {
    filters,
  });

  const data = useMemo(() => {
    return riskScoreResults
      .map(item => ({
        date: new Date(item.date),
        count: item.count,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [riskScoreResults]);

  const { normalizedData } = useMemo(() => {
    if (data.length === 0) {
      return { normalizedData: [], minValue: 0, maxValue: 0 };
    }
    const minValue = Math.min(...data.map(d => d.count));
    const maxValue = Math.max(...data.map(d => d.count));
    const normalizedData = data.map(item => ({
      ...item,
      normalizedCount: (item.count - minValue) / (maxValue - minValue),
    }));
    return { normalizedData, minValue, maxValue };
  }, [data]);

  const percentageChange = useMemo(() => {
    if (data.length < 2) {
      return 0;
    }
    const firstValue = data[0].count;
    const lastValue = data[data.length - 1].count;
    if (firstValue === 0) {
      return lastValue > 0 ? 100 : 0;
    }
    return ((lastValue - firstValue) / firstValue) * 100;
  }, [data]);

  const abbreviatedPercentageChange = parseFloat(abbreviate(percentageChange, 1));

  const trendColor =
    abbreviatedPercentageChange > 0 ? 'red' : abbreviatedPercentageChange < 0 ? 'green' : 'blue';
  const badgeIcon =
    abbreviatedPercentageChange > 0
      ? 'TrendUp'
      : abbreviatedPercentageChange < 0
        ? 'TrendDown'
        : 'Minus';

  return (
    <OverviewTile
      title="Risk score over time"
      badge={{
        label: `${abbreviate(percentageChange, 1)}%`,
        color: trendColor as BadgeColors,
        iconName: badgeIcon,
      }}>
      <OverviewStateBoundary
        isEmpty={normalizedData.length === 0 || normalizedData.every(item => item.count === 0)}>
        <ChartProvider
          xScale={{ type: 'time', nice: true }}
          yScale={{ type: 'linear', nice: true }}
          theme={{
            colors: [lineColor(trendColor)],
          }}>
          <Chart margin={{ top: 20, right: 20, bottom: 40, left: 50 }}>
            <XAxis
              numTicks={4}
              tickFormat={tick => format(tick, 'd/M')}
              tickLabelProps={() => ({
                dy: 10,
                dx: 10,
                fill: 'var(--color-text-secondary)',
                fontSize: 12,
                textAnchor: 'middle',
              })}
            />
            <YAxis
              numTicks={4}
              tickFormat={value => {
                const minValue = Math.min(...data.map(d => d.count));
                const maxValue = Math.max(...data.map(d => d.count));

                return abbreviate(value * (maxValue - minValue) + minValue);
              }}
              tickLabelProps={() => ({
                dx: 16,
                dy: -16,
                fontSize: 12,
                textAnchor: 'end',
              })}
            />
            <Line
              dataKey="Risk score"
              data={normalizedData}
              xAccessor={d => d?.date}
              yAccessor={d => d?.normalizedCount}
            />
            <ChartTooltip datumIndicator={LineDatumIndicator} useAbsoluteYValue />
          </Chart>
          <ChartLegend item={LineLegendItem} />
        </ChartProvider>
      </OverviewStateBoundary>
    </OverviewTile>
  );
}

const lineColor = trendColor => {
  switch (trendColor) {
    case 'red':
      return 'var(--color-red-50)';
    case 'green':
      return 'var(--color-green-45)';
    case 'blue':
      return 'var(--color-blue-60)';
    default:
      return 'var(--color-blue-gray-50)';
  }
};
