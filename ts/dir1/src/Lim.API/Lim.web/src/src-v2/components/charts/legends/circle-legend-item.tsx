import { useChartContext } from '@src-v2/components/charts';
import { Circle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';

export const LegendCircle = ({ category }) => {
  const { colorScale } = useChartContext();

  return <Circle size={Size.XXXSMALL} style={{ backgroundColor: colorScale(category) }} />;
};
