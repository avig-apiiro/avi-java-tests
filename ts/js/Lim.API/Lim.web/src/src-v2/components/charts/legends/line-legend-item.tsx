import { useChartContext } from '@src-v2/components/charts';

export const LineLegendItem = ({ dataKey, ...props }: { dataKey: string }) => {
  const { colorScale, getDataStyle } = useChartContext();

  return (
    <svg {...props} height={2} width={16} overflow="visible">
      <line
        style={getDataStyle(dataKey)}
        x1={0}
        y1={1}
        x2={16}
        y2={1}
        stroke={colorScale(dataKey)}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </svg>
  );
};
