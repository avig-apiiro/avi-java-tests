import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { BarGroup, Line } from '@visx/shape';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { LineDatumIndicator } from '@src-v2/components/charts/tooltips';
import { TooltipContent } from '@src-v2/components/charts/tooltips/plain-chart-tooltip';
import { Heading, Heading5, ListItem, UnorderedList } from '@src-v2/components/typography';
import { abbreviate } from '@src-v2/utils/number-utils';
import { humanize } from '@src-v2/utils/string-utils';

interface TooltipData {
  xValue: string | number;
  bars: {
    key: string;
    value: number;
    index: number;
    height: number;
    width: number;
    x: number;
    y: number;
    color: string;
  }[];
}

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const BarsChart = styled.svg`
  height: 100%;

  .visx-axis {
    line {
      stroke: transparent;
    }

    text {
      fill: var(--color-blue-gray-70);
    }
  }
`;

const GroupedBarsGrid = ({ yScale, width }) => {
  const ticks = yScale.ticks(5);

  return (
    <Group>
      {ticks.map((tick: number, i: number) => (
        <Line
          key={`horizontal-grid-${i}`}
          x1={0}
          x2={width}
          y1={yScale(tick)}
          y2={yScale(tick)}
          stroke="var(--color-blue-gray-20)"
          strokeOpacity={1}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}
    </Group>
  );
};

interface BarGroupChartProps {
  data: any[];
  keys: string[];
  colors: { [key: string]: string };
  onClick: (bar: any) => void;
  xAccessor: string;
  labelFormat: (key: string) => string;
}

export const BarGroupChart: React.FC<BarGroupChartProps> = ({
  data,
  keys,
  colors,
  onClick,
  xAccessor,
  labelFormat = humanize,
}) => {
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip<TooltipData>();
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>, barGroup: any, datum: any) => {
      if (svgRef.current) {
        const svgRect = svgRef.current.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;
        const mouseY = event.clientY - svgRect.top;
        showTooltip({
          tooltipData: { ...barGroup, xValue: datum[xAccessor] },
          tooltipTop: mouseY,
          tooltipLeft: mouseX,
        });
      }
    },
    [showTooltip, xAccessor]
  );

  return (
    <ParentSize>
      {({ width, height }) => {
        const margin = { top: 10, right: 10, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const x0Scale = scaleBand({
          domain: data.map(d => d[xAccessor]),
          range: [0, innerWidth],
          padding: 0.2,
        });

        const x1Scale = scaleBand({
          domain: keys,
          range: [0, x0Scale.bandwidth() || 0],
          padding: 0.2,
        });

        const yMax = Math.max(...data.map(d => Math.max(...keys.map(key => Number(d[key])))));
        const yScale = scaleLinear<number>({
          domain: [0, yMax],
          range: [innerHeight, 0],
          nice: true,
        });

        const yTickValues = [0, yMax / 3, (2 * yMax) / 3, yMax].map(
          num => Math.ceil(num / 10) * 10
        );

        return (
          <ChartContainer>
            <BarsChart width={width} height={height} ref={svgRef}>
              <Group top={margin.top} left={margin.left}>
                <GroupedBarsGrid yScale={yScale} width={innerWidth} />
                <AxisLeft
                  scale={yScale}
                  tickValues={yTickValues}
                  tickFormat={(value: number) => abbreviate(value, 1)}
                  stroke="transparent"
                  tickLabelProps={() => ({
                    fill: 'var(--color-blue-gray-70)',
                    fontSize: 12,
                    textAnchor: 'end',
                    dy: '0.33em',
                  })}
                />
                <AxisBottom
                  scale={x0Scale}
                  top={innerHeight}
                  stroke="transparent"
                  tickLabelProps={() => ({
                    fill: 'var(--color-blue-gray-70)',
                    fontSize: 12,
                    textAnchor: 'middle',
                  })}
                />
                <BarGroup
                  data={data}
                  keys={keys}
                  height={innerHeight}
                  x0={d => d[xAccessor]}
                  x0Scale={x0Scale}
                  x1Scale={x1Scale}
                  yScale={yScale}
                  color={(key: string) => colors[key]}>
                  {barGroups =>
                    barGroups.map((barGroup: any, i: number) => (
                      <Group
                        key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                        left={barGroup.x0}
                        onMouseMove={(event: React.MouseEvent<SVGRectElement>) =>
                          handleMouseMove(event, barGroup, data[i])
                        }
                        onMouseLeave={() => hideTooltip()}>
                        {barGroup.bars.map((bar: any) => (
                          <rect
                            key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.key}`}
                            x={bar.x}
                            y={bar.y}
                            width={bar.width}
                            height={bar.height}
                            fill={bar.color}
                            onClick={() =>
                              onClick({
                                ...bar,
                                barGroupIndex: barGroup.index,
                              })
                            }
                          />
                        ))}
                      </Group>
                    ))
                  }
                </BarGroup>
              </Group>
            </BarsChart>
            {tooltipOpen && tooltipData && (
              <TooltipWithBounds key={Math.random()} top={tooltipTop} left={tooltipLeft}>
                <TooltipContent>
                  <Heading>{humanize(tooltipData.xValue)}</Heading>
                  <UnorderedList>
                    {tooltipData.bars.map(bar => (
                      <ListItem key={bar.key}>
                        <LineDatumIndicator dataKey={bar.key} />
                        <ItemContainer>
                          <Heading5>{labelFormat(bar.key)}</Heading5>
                          <Heading5>{abbreviate(bar.value)}</Heading5>
                        </ItemContainer>
                      </ListItem>
                    ))}
                  </UnorderedList>
                </TooltipContent>
              </TooltipWithBounds>
            )}
          </ChartContainer>
        );
      }}
    </ParentSize>
  );
};

const ItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
`;
