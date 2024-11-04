import { AxisScale } from '@visx/axis';
import { AnimatedBarSeries } from '@visx/xychart';
import { BaseBarSeriesProps } from '@visx/xychart/lib/components/series/private/BaseBarSeries';
import { EventHandlerParams } from '@visx/xychart/lib/types/series';
import _ from 'lodash';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Chart } from '@src-v2/components/charts/chart';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const BarsChart = styled(Chart)`
  .visx-rows > line {
    stroke: var(--color-blue-gray-20) !important;
  }

  .visx-axis text {
    font-size: 2.75rem;
    font-weight: 400;
    width: 100rem;
    transform: translate(2rem, 0.5rem);
  }

  .visx-bar[data-clickable] {
    cursor: pointer;
    transition: filter 200ms ease-in-out;

    &:hover {
      box-shadow: var(--elevation-8);
      filter: drop-shadow(0 -2rem 3.5rem rgba(1, 32, 112, 0.12))
        drop-shadow(0px -1px 0.75rem rgba(1, 32, 112, 0.22));
    }
  }
`;

export function Bars<Datum extends object>({
  onClick,
  onPointerMove = _.noop,
  onPointerOut = _.noop,
  ...props
}: { data: Datum[]; onClick: (event: EventHandlerParams<Datum>) => void } & Omit<
  BaseBarSeriesProps<AxisScale, AxisScale, Datum>,
  'BarsComponent' | 'onMouseUp' | 'onPointerDown' | 'data'
>) {
  const handlePointerDown = useCallback(
    (eventHandlerParams: EventHandlerParams<Datum>) => {
      const { event } = eventHandlerParams;
      if (isInstancePointerEvent(event) && event.button === 0) {
        onClick?.(eventHandlerParams);
      }
    },
    [onClick]
  );

  return (
    <AnimatedBarSeries<AxisScale, AxisScale, Datum>
      {...props}
      data-clickable={dataAttr(Boolean(onClick))}
      onPointerUp={handlePointerDown}
      onPointerMove={onClick ? onPointerMove : null}
      onPointerOut={onPointerOut}
    />
  );
}

function isInstancePointerEvent(event: any): event is PointerEvent {
  return 'button' in event;
}
