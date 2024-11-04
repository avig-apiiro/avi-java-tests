import styled from 'styled-components';
import { useChartContext } from '@src-v2/components/charts';
import { Circle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';

export function LineDatumIndicator({ dataKey }) {
  const { getDataStyle, colorScale } = useChartContext();

  return (
    <svg height={12} width={3} overflow="visible">
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={12}
        style={getDataStyle(dataKey)}
        stroke={colorScale(dataKey)}
        strokeLinecap="round"
        strokeWidth={3}
      />
    </svg>
  );
}

export const AreaDatumIndicator = styled(({ dataKey, ...props }) => {
  return (
    <Circle
      {...props}
      size={Size.XXSMALL}
      style={{ background: useChartContext().colorScale(dataKey) }}
    />
  );
})`
  border: none;
`;
