import { AxisScale } from '@visx/axis';
import { AnimatedLineSeries } from '@visx/xychart';
import { BaseLineSeriesProps } from '@visx/xychart/lib/components/series/private/BaseLineSeries';
import { useChartContext } from '@src-v2/components/charts/chart-provider';

export function Line<XScale extends AxisScale, YScale extends AxisScale, Datum extends object>({
  style = {},
  ...props
}: Omit<BaseLineSeriesProps<XScale, YScale, Datum>, 'PathComponent'>) {
  const { getDataStyle } = useChartContext();
  return <AnimatedLineSeries {...props} style={{ ...style, ...getDataStyle(props.dataKey) }} />;
}
