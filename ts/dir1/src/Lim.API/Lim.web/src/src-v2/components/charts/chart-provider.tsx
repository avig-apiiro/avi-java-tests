import { AxisScaleOutput } from '@visx/axis';
import { ScaleConfig } from '@visx/scale';
import { getFirstItem, getSecondItem } from '@visx/shape/lib/util/accessors';
import { DataContext, DataProvider } from '@visx/xychart';
import { DataProviderProps } from '@visx/xychart/lib/providers/DataProvider';
import { XYChartTheme } from '@visx/xychart/lib/types';
import { CSSProperties, createContext, useContext, useState } from 'react';
import { humanize } from '@src-v2/utils/string-utils';

const ExtendedContext = createContext<{
  tooltipIndex: number;
  updateTooltipIndex: (number) => void;
  dataKeyToStyle?: Record<string, CSSProperties>;
  labelFormat: (string) => string;
}>(null);

export function useChartContext() {
  const dataContext = useContext(DataContext);
  const { dataKeyToStyle = {}, ...extendedContext } = useContext(ExtendedContext);
  return {
    ...dataContext,
    ...extendedContext,
    getDataStyle: dataKey => dataKeyToStyle[dataKey] ?? {},
    getXAccessor: dataKey => dataContext.dataRegistry.get(dataKey).xAccessor,
    getYAccessor: dataKey => {
      const { yAccessor } = dataContext.dataRegistry.get(dataKey);
      return yAccessor?.name === 'getNumericValue' ? maxYAccessor : yAccessor;
    },
  };
}

function maxYAccessor(bar) {
  return Math.max(getFirstItem(bar), getSecondItem(bar));
}

export function ChartProvider<Datum extends object = {}>({
  dataKeyToStyle,
  labelFormat = (dataKey: string) => humanize(dataKey),
  theme,
  children,
  ...props
}: {
  dataKeyToStyle?: Record<string, CSSProperties>;
  labelFormat?: (string) => string;
  theme?: Partial<XYChartTheme>;
} & Omit<DataProviderProps<ScaleConfig<AxisScaleOutput>, ScaleConfig<AxisScaleOutput>>, 'theme'>) {
  const [tooltipIndex, updateTooltipIndex] = useState<number>();

  return (
    <DataProvider<ScaleConfig<AxisScaleOutput>, ScaleConfig<AxisScaleOutput>, Datum>
      {...props}
      theme={theme as XYChartTheme}>
      <ExtendedContext.Provider
        value={{ dataKeyToStyle, labelFormat, tooltipIndex, updateTooltipIndex }}>
        {children}
      </ExtendedContext.Provider>
    </DataProvider>
  );
}
