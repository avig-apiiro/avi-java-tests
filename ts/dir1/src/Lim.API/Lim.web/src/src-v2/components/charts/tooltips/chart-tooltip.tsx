import { ScaleInput } from '@visx/scale';
import { AxisScale, DataContextType } from '@visx/xychart';
import { InferDatum, InferYScaleConfig } from '@visx/xychart/lib/context/DataContext';
import { TooltipData } from '@visx/xychart/lib/types/tooltip';
import { format } from 'date-fns';
import _ from 'lodash';
import { ComponentType, ReactNode } from 'react';
import styled from 'styled-components';
import { useChartContext } from '@src-v2/components/charts';
import {
  ChartTooltipProps,
  Glyph,
  PlainChartTooltip,
} from '@src-v2/components/charts/tooltips/plain-chart-tooltip';
import { Heading, ListItem, UnorderedList } from '@src-v2/components/typography';
import { abbreviate } from '@src-v2/utils/number-utils';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export const ChartTooltip = <Datum extends object>({
  datumIndicator: DatumIndicator,
  formatHeading = defaultFormat,
  showSeriesGlyphs = true,
  useAbsoluteYValue = false,
  ...props
}: {
  datumIndicator: ComponentType<{ dataKey: string }>;
  formatHeading?: (xValue: any) => ReactNode;
  useAbsoluteYValue?: boolean;
} & Omit<ChartTooltipProps<Datum>, 'renderTooltip'>) => {
  const { getXAccessor, getYAccessor, labelFormat } = useChartContext();

  return (
    <PlainChartTooltip<Datum>
      {...props}
      showSeriesGlyphs={showSeriesGlyphs}
      showVerticalCrosshair
      snapTooltipToDatumX
      renderGlyph={Glyph}
      renderTooltip={({ tooltipData }) => {
        const items = extractDatumItems(tooltipData, getYAccessor, useAbsoluteYValue);

        return (
          <>
            <Heading>
              {formatHeading(
                getXAccessor(tooltipData.nearestDatum.key)(tooltipData.nearestDatum.datum)
              )}
            </Heading>
            <UnorderedList>
              {items.map(datumInfo => (
                <ListItem key={datumInfo.dataKey}>
                  <DatumIndicator dataKey={datumInfo.dataKey} />
                  <DatumLabel>{labelFormat(datumInfo.dataKey)}</DatumLabel>
                  <DatumValue>{datumInfo.yValue}</DatumValue>
                </ListItem>
              ))}
            </UnorderedList>
          </>
        );
      }}
    />
  );
};

type StackedDatum<Datum extends object> = Datum & {
  data: any;
};

function extractDatumItems<Datum extends object>(
  { nearestDatum, datumByKey }: TooltipData<Datum>,
  getYAccessor: (
    dataKey: string
  ) => (
    d: InferDatum<DataContextType<AxisScale, AxisScale, any>>
  ) => ScaleInput<InferYScaleConfig<DataContextType<AxisScale, AxisScale, any>>>,
  useAbsoluteYValue: boolean
): { dataKey: string; yValue: string }[] {
  const nearestDatumInfo = nearestDatum.datum;
  if (isTypeOf<StackedDatum<Datum>>(nearestDatumInfo, 'data')) {
    return Object.keys(datumByKey).map(dataKey => ({
      dataKey,
      yValue: abbreviate(nearestDatumInfo.data[dataKey]),
    }));
  }
  return Object.values(datumByKey).map(datumInfo => {
    const yAccessor = getYAccessor(datumInfo.key);
    const yValue = yAccessor(datumInfo.datum);
    const absoluteValue = (datumInfo.datum as any).count;
    return {
      dataKey: datumInfo.key,
      yValue: useAbsoluteYValue ? abbreviate(absoluteValue ?? yValue) : abbreviate(yValue),
    };
  });
}

function defaultFormat(xValue: any) {
  return _.isDate(xValue) ? format(xValue, 'd MMM yyyy') : xValue?.toString();
}

const DatumLabel = styled.span`
  flex-grow: 1;
`;

const DatumValue = styled.span``;
