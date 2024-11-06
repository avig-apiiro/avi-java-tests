import { AnimatedAxis } from '@visx/xychart';
import styled from 'styled-components';
import { useChartContext } from '@src-v2/components/charts/chart-provider';
import { abbreviate } from '@src-v2/utils/number-utils';

export const XAxis = styled(({ className, tickValues, numTicks, ...props }) => {
  const { dataRegistry } = useChartContext();
  const dataKeys = dataRegistry.keys();
  const numOfTicks =
    numTicks ??
    (tickValues?.length ?? dataKeys?.length === 1
      ? dataRegistry.get(dataKeys[0])?.data?.length
      : dataKeys?.length);

  return (
    <AnimatedAxis
      {...props}
      tickValues={tickValues}
      numTicks={numOfTicks}
      orientation="bottom"
      axisClassName={className}
      stroke="var(--color-blue-gray-20)"
      tickStroke="var(--color-blue-gray-25)"
      tickLabelProps={{ fill: 'var(--default-text-color)', fontWeight: 400 }}
    />
  );
})`
  .visx-axis-tick {
    text {
      transform: translateY(1.5rem);
      font-family: inherit;
      font-size: 2.75rem;

      &:not([text-anchor]) {
        text-anchor: middle;
      }
    }

    line {
      transform: rotateX(180deg);
    }
  }
`;

export const YAxis = styled(({ className, children, tickFormat = abbreviate, ...props }) => (
  <AnimatedAxis
    {...props}
    hideTicks
    hideAxisLine
    orientation="left"
    axisClassName={className}
    tickFormat={tickFormat}
  />
))`
  text {
    font-family: inherit;
    font-size: 2.75rem;
    transform: translateY(0.875rem);
  }
`;
