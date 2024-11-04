import { AxisBottom, AxisLeft } from '@visx/axis';
import { Grid } from '@visx/grid';
import { Group } from '@visx/group';
import { scalePoint } from '@visx/scale';
import { Circle } from '@visx/shape';
import { Text } from '@visx/text';
import { ScalePoint } from 'd3-scale';
import { ComponentType, useState } from 'react';
import styled from 'styled-components';
import { SvgRoot } from '@src-v2/components/svg/svg-elements';
import { formatNumber } from '@src-v2/utils/number-utils';

interface BubbleChartProps<TDatum extends Record<string, Record<string, number>>> {
  width: number;
  height: number;
  margin?: Record<string, number>;
  data: TDatum;
  getBubbleColor: (x: keyof TDatum, y: keyof TDatum[keyof TDatum]) => string;
  getTextColor: (x: keyof TDatum, y: keyof TDatum[keyof TDatum]) => string;
  handleValueClick?: (x: keyof TDatum, y: keyof TDatum[keyof TDatum]) => void;
  getBubbleSize?: (value: number) => number;
  yLabels: string[];
  xLabels: string[];
  xAxisLabel: string;
  CustomYAxis?: ComponentType<{ yScale: ScalePoint<string>; height: number }>;
}

export type BubbleData = Record<string, Record<string, number>>;

export function BubbleChart<TDatum extends BubbleData>({
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 36 },
  data,
  getBubbleColor,
  getTextColor,
  handleValueClick,
  getBubbleSize = defaultGetBubbleSize,
  xLabels,
  yLabels,
  xAxisLabel,
  CustomYAxis,
}: BubbleChartProps<TDatum>) {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const [hoveredBubble, setHoveredBubble] = useState<{ x: string; y: string } | null>(null);

  const xScale = scalePoint({
    domain: xLabels.filter(Boolean),
    range: [0, chartWidth],
    padding: chartWidth / 400,
  });

  const yScale = scalePoint({
    domain: yLabels.filter(Boolean),
    range: [chartHeight, 0],
    padding: chartWidth / 400,
  });

  const bubbles = [];
  xLabels.forEach(x => {
    yLabels.forEach(y => {
      const value = data[x][y];
      if (x && y && value) {
        bubbles.push({
          x,
          y,
          value,
          isHovered: hoveredBubble?.x === x && hoveredBubble?.y === y,
        });
      }
    });
  });

  const sortedBubbles = [...bubbles].sort((a, _) => (a.isHovered ? 1 : -1));

  return (
    <BubbleChartContainer width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <Grid
          top={0}
          left={0}
          xScale={xScale}
          yScale={yScale}
          width={chartWidth}
          height={chartHeight}
          stroke="lightgray"
          strokeOpacity={0.5}
        />
        <AxisBottom
          top={chartHeight}
          scale={xScale}
          stroke="lightgray"
          label={xAxisLabel}
          labelProps={{
            fontSize: 12,
            dy: '-1rem',
            fontFamily: 'Mulish',
          }}
          tickStroke="none"
          tickLabelProps={() => ({
            fontSize: 12,
            textAnchor: 'middle',
            dy: '0.5rem',
          })}
        />
        {CustomYAxis ? (
          <CustomYAxis yScale={yScale} height={chartHeight} />
        ) : (
          <AxisLeft
            scale={yScale}
            stroke="lightgray"
            tickStroke="none"
            tickLabelProps={() => ({
              fill: 'var(--color-blue-gray-70)',
              fontSize: 12,
              textAnchor: 'end',
              dy: '0.75rem',
            })}
          />
        )}
        {sortedBubbles.map(({ x, y, value, isHovered }) => (
          <Bubble
            key={`${x}-${y}`}
            left={xScale(x)}
            top={yScale(y)}
            onMouseEnter={() => setHoveredBubble({ x, y })}
            onMouseLeave={() => setHoveredBubble(null)}
            onClick={
              handleValueClick
                ? () => handleValueClick(x as keyof TDatum, y as keyof TDatum[keyof TDatum])
                : undefined
            }>
            <Circle
              r={getBubbleSize(value)}
              fill={getBubbleColor(x as keyof TDatum, y as keyof TDatum[keyof TDatum])}
              opacity={!handleValueClick || isHovered ? 1 : 0.7}
            />
            <Text
              x={0}
              y={0}
              verticalAnchor="middle"
              textAnchor="middle"
              fontSize={12}
              fill={getTextColor(x as keyof TDatum, y as keyof TDatum[keyof TDatum])}>
              {formatNumber(value)}
            </Text>
          </Bubble>
        ))}
      </Group>
    </BubbleChartContainer>
  );
}

const Bubble = styled(Group)`
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
`;

const BubbleChartContainer = styled(SvgRoot)`
  overflow: visible;

  .visx-axis-label {
    font-size: 12px;
    translate: 0 1rem;
  }
`;

function defaultGetBubbleSize(value) {
  if (value <= 10) {
    return 8;
  }
  if (value <= 100) {
    return calculateLinearInterpolation(value, 10, 100, 17, 32);
  }
  if (value <= 1000) {
    return calculateLinearInterpolation(value, 100, 1000, 33, 48);
  }
  if (value <= 10000) {
    return calculateLinearInterpolation(value, 1000, 10000, 49, 64);
  }
  if (value <= 100000) {
    return calculateLinearInterpolation(value, 10000, 100000, 65, 80);
  }
  if (value <= 1000000) {
    return calculateLinearInterpolation(value, 100000, 1000000, 81, 99);
  }
  return 50;
}

function calculateLinearInterpolation(
  value: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number
) {
  const m = (y2 - y1) / (x2 - x1);
  return 0.5 * (m * (value - x1) + y1);
}
