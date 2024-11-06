import { LegendOrdinal } from '@visx/legend';
import { ComponentType, ReactNode } from 'react';
import styled from 'styled-components';
import { useChartContext } from '@src-v2/components/charts';

export const ChartLegend = ({
  item: Item,
  children,
  ...props
}: {
  item?: ComponentType<{ dataKey: string }>;
  children?: ReactNode;
}) => {
  const { colorScale, labelFormat } = useChartContext();

  return (
    <LegendOrdinal scale={colorScale}>
      {formattedLabels => (
        <LegendLine {...props}>
          {Item &&
            formattedLabels.map(({ text: dataKey }) => (
              <LegendItem key={dataKey}>
                <Item dataKey={dataKey} />
                {labelFormat(dataKey)}
              </LegendItem>
            ))}
          {children}
        </LegendLine>
      )}
    </LegendOrdinal>
  );
};

export const LegendLine = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  font-size: var(--font-size-xs);
`;

const LegendItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;
