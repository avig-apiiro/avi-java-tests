import { ComponentType, ReactNode } from 'react';
import styled from 'styled-components';
import { useChartContext } from '@src-v2/components/charts';
import { LineLegendItem } from '@src-v2/components/charts/legends/line-legend-item';

interface GroupedBarChartLegendProps {
  keys: string[];
  item?: ComponentType<{ dataKey: string; color: string }>;
  children?: ReactNode;
}

export const GroupedBarChartLegend = ({
  keys,
  item: Item,
  children,
  ...props
}: GroupedBarChartLegendProps) => {
  const { theme, labelFormat } = useChartContext();

  return (
    <LegendLine {...props}>
      {keys.map((key, index) => (
        <LegendItem key={key}>
          {Item && <Item dataKey={key} color={theme.colors[index]} />}
          <LegendText>{labelFormat ? labelFormat(key) : key}</LegendText>
        </LegendItem>
      ))}
      {children}
    </LegendLine>
  );
};

const LegendLine = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  font-size: var(--font-size-xs);
  margin-top: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const LegendText = styled.span`
  color: var(--color-blue-gray-70);
  white-space: nowrap;
`;

export const GroupedBarLegendItem = ({ dataKey }: { dataKey: string }) => (
  <LineLegendItem dataKey={dataKey} />
);
