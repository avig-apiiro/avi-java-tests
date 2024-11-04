import { AxisScaleOutput } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { ScaleConfig } from '@visx/scale';
import { AnimatedGrid, XYChart } from '@visx/xychart';
import { XYChartProps } from '@visx/xychart/lib/components/XYChart';
import { EventHandlerParams } from '@visx/xychart/lib/types';
import styled from 'styled-components';
import '@src-v2/components/charts';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const Chart = styled(
  <Datum extends object>({
    className,
    style,
    hideGrid = false,
    onClick,
    children,
    ...props
  }: StyledProps<{ hideGrid?: boolean; onClick?: (event: EventHandlerParams<Datum>) => void }> &
    Omit<
      XYChartProps<
        ScaleConfig<AxisScaleOutput, any, any>,
        ScaleConfig<AxisScaleOutput, any, any>,
        Datum
      >,
      'onPointerUp'
    >) => {
    return (
      <ParentSize className={className} style={style} data-clickable={dataAttr(Boolean(onClick))}>
        {({ width, height }) => (
          <XYChart<
            ScaleConfig<AxisScaleOutput, any, any>,
            ScaleConfig<AxisScaleOutput, any, any>,
            Datum
          >
            {...props}
            width={width}
            height={height}
            margin={{ top: 10, bottom: 25, left: 25, right: 25 }}
            onPointerUp={onClick}>
            {!hideGrid && (
              <AnimatedGrid
                columns={false}
                numTicks={4}
                stroke="var(--color-blue-gray-20)"
                strokeDasharray="3 3"
              />
            )}
            {children}
          </XYChart>
        )}
      </ParentSize>
    );
  }
)`
  display: flex;
  max-height: 100%;
  flex-direction: column;

  &[data-clickable] svg {
    cursor: pointer;
  }
`;
