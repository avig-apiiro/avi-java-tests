import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import DoughnutWrapper from '@visx/shape/lib/shapes/Pie';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { AnimatedDoughnut } from '@src-v2/components/charts/doughnut-chart/animated-doughnut';
import { DoughnutData, DoughnutProps } from '@src-v2/components/charts/doughnut-chart/types';
import { SvgRoot } from '@src-v2/components/svg/svg-elements';
import { formatNumber } from '@src-v2/utils/number-utils';

export function DoughnutChart({
  data,
  onClick,
  getArcColor,
  dataLabels,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
}: DoughnutProps<typeof data>) {
  const { orderedData, totalCount } = useMemo(
    () => ({
      orderedData: _.orderBy(data, 'count'),
      totalCount: _.sumBy(data, 'count'),
    }),
    [data]
  );

  const [selectedDatum, setSelectedDatum] = useState<string>(_.last(orderedData)?.key);
  const selectedDataCount = data.find((d: DoughnutData) => d.key === selectedDatum)?.count || 0;
  const selectedPercentage =
    totalCount > 0 ? Math.round(100 * (selectedDataCount / totalCount)) : 0;

  return (
    <ParentSize>
      {({ width, height }) => {
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const radius = Math.min(innerWidth, innerHeight) / 2.2;
        const centerY = innerHeight / 2;
        const centerX = innerWidth / 2;

        return (
          <SvgRoot width={width} height={height}>
            <Group top={centerY + margin.top} left={centerX + margin.left}>
              <Doughnut
                data={orderedData}
                radius={radius}
                onClickDatum={onClick}
                selectedDatum={selectedDatum}
                setSelectedDatum={setSelectedDatum}
                getArcColor={getArcColor}
              />
              <DatumDetails
                label={dataLabels[selectedDatum]}
                tagColor={getArcColor(selectedDatum)}
                selectedPercentage={selectedPercentage}
                selectedDatum={selectedDatum}
                selectedDataCount={selectedDataCount}
              />
            </Group>
          </SvgRoot>
        );
      }}
    </ParentSize>
  );
}

const Doughnut = ({
  data,
  radius,
  donutThickness = 24,
  onClickDatum,
  selectedDatum,
  setSelectedDatum,
  getArcColor,
}) => (
  <DoughnutWrapper
    data={data}
    pieValue={(d: DoughnutData) => d.count}
    outerRadius={radius}
    innerRadius={radius - donutThickness}
    padAngle={0.03}>
    {DoughnutProps => (
      <AnimatedDoughnut
        {...DoughnutProps}
        getKey={(arc: { data: DoughnutData }) => arc.data.key}
        onHoverDatum={({ data: { key } }) =>
          setSelectedDatum(
            selectedDatum && selectedDatum === key ? _.last<DoughnutData>(data)?.key : key
          )
        }
        onLeaveDatum={() => setSelectedDatum(_.last<DoughnutData>(data)?.key)}
        onClickDatum={() => onClickDatum(selectedDatum)}
        isDatumSelected={arc => arc.data.key === selectedDatum}
        getArcColor={arc => getArcColor(arc.data.key)}
      />
    )}
  </DoughnutWrapper>
);

const DatumDetails = styled(
  ({ selectedPercentage, label, selectedDatum, selectedDataCount, tagColor, ...props }) =>
    selectedDatum && (
      <g {...props}>
        <text data-percentage textAnchor="middle" y={-9} x={3}>
          {selectedPercentage}%
        </text>
        <text data-tag x={0} y={12} textAnchor="middle">
          {label}
        </text>
        <text data-count x={0} y={34} textAnchor="middle">
          {formatNumber(selectedDataCount)}
        </text>
      </g>
    )
)`
  & [data-percentage] {
    font-size: var(--font-size-xxl);
    font-weight: 700;
    fill: var(--color-blue-gray-70);
  }

  & [data-tag] {
    font-weight: 400;
    font-size: var(--font-size-xs);
    fill: var(--color-blue-gray-70);
  }

  & [data-count] {
    fill: var(--color-blue-gray-60);
    font-size: var(--font-size-s);
    font-weight: 400;
  }
`;
