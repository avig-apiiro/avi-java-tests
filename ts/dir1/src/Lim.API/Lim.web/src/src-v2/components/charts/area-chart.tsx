import { AxisScaleOutput } from '@visx/axis';
import { ScaleConfig } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';
import { TooltipContext, TooltipData } from '@visx/xychart';
import { XYChartProps } from '@visx/xychart/lib/components/XYChart';
import { EventHandlerParams } from '@visx/xychart/lib/types/series';
import { CSSProperties, useCallback, useMemo } from 'react';
import { Chart, useChartContext } from '@src-v2/components/charts';

export function AreaChart<
  XScaleConfig extends ScaleConfig<AxisScaleOutput, any, any>,
  YScaleConfig extends ScaleConfig<AxisScaleOutput, any, any>,
  Datum extends object,
>({
  ...props
}: Partial<{ hideGrid: boolean; className: string; style: CSSProperties }> &
  XYChartProps<XScaleConfig, YScaleConfig, Datum>) {
  const tooltipContext = useTooltip<TooltipData<Datum>>();
  const { dataRegistry, xScale, getXAccessor } = useChartContext();

  const onPointerMove = useCallback(
    ({ key, index, svgPoint, datum, distanceX: distance }: EventHandlerParams<Datum>) => {
      const tooltipLeft = Number.parseFloat(xScale(getXAccessor(key)(datum))?.toString() ?? '0');

      const dataKeys = dataRegistry.keys();
      const datumByKey = dataKeys.reduce((result, dataKey) => {
        const datum = dataRegistry.get(dataKey).data[index];

        return {
          ...result,
          [dataKey]: { key: dataKey, index, datum },
        };
      }, {});

      tooltipContext.updateTooltip(args => ({
        ...args,
        tooltipOpen: true,
        tooltipTop: svgPoint.y,
        tooltipLeft,
        tooltipData: {
          nearestDatum: {
            key,
            index,
            distance,
            datum,
          },
          datumByKey,
        },
      }));
    },
    [tooltipContext]
  );

  const contextValue = useMemo(
    () => ({
      ...tooltipContext,
      showTooltip: () => tooltipContext.showTooltip(tooltipContext),
    }),
    [tooltipContext]
  );

  return (
    <TooltipContext.Provider value={contextValue}>
      <Chart {...props} onPointerMove={onPointerMove} onPointerOut={tooltipContext.hideTooltip} />
    </TooltipContext.Provider>
  );
}
