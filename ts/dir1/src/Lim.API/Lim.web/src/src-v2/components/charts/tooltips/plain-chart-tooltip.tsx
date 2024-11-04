import { Tooltip } from '@visx/xychart';
import { TooltipProps } from '@visx/xychart/lib/components/Tooltip';
import styled from 'styled-components';
import { Heading, Heading5, ListItem, UnorderedList } from '@src-v2/components/typography';

export type ChartTooltipProps<Datum extends object> = Omit<
  TooltipProps<Datum>,
  'applyPositionStyle' | 'verticalCrosshairStyle'
>;

export function PlainChartTooltip<Datum extends object>({
  renderGlyph = EmptyGlyph,
  renderTooltip,
  style,
  className,
  ...props
}: ChartTooltipProps<Datum>) {
  return (
    <Tooltip<Datum>
      {...props}
      applyPositionStyle
      verticalCrosshairStyle={{ stroke: 'var(--color-blue-gray-25)', strokeDasharray: '4 2' }}
      style={{
        background: 'none',
        boxShadow: 'none',
      }}
      renderGlyph={renderGlyph}
      renderTooltip={params => (
        <TooltipContent className={className} style={style}>
          {renderTooltip(params)}
        </TooltipContent>
      )}
    />
  );
}

export function EmptyGlyph() {
  return null;
}

export function Glyph({ x, y, color, datum, size }) {
  if (Array.isArray(datum)) {
    y = BarTooltipOffset * (Math.max(...datum) - Math.min(...datum)) + size;
  }

  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={4}
        fill="var(--color-white)"
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.2}
      />
      <circle cx={x} cy={y} r={3} fill={color} strokeWidth={0} />
    </>
  );
}

const BarTooltipOffset = -2;

export const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 45rem;
  max-height: 80rem;
  border-radius: 3rem;
  background-color: var(--color-white);
  box-shadow: var(--elevation-2);
  padding: 4rem;
  gap: 3rem;

  > ${Heading} {
    margin-bottom: 0;
    font-size: var(--font-size-m);
    font-weight: 600;
  }
  ${Heading5} {
    text-transform: unset;
  }
  > ${UnorderedList} {
    padding: 0;

    ${ListItem} {
      display: flex;
      height: 6rem;
      align-items: center;
      gap: 2rem;
      font-size: var(--font-size-s);

      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
  }
`;
