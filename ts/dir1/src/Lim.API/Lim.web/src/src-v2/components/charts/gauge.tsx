import { a, useSpring } from '@react-spring/web';
import { Group } from '@visx/group';
import Pie from '@visx/shape/lib/shapes/Pie';
import { easeQuadInOut } from 'd3-ease';
import { useMemo } from 'react';
import { SvgRoot } from '@src-v2/components/svg/svg-elements';

const getArcColor = (value, tickValue) => {
  if (tickValue === 0) {
    return 'var(--color-blue-gray-15)';
  }
  return value > tickValue ? 'var(--color-red-50)' : 'var(--color-green-45)';
};

function AnimatedArcs({ arcs: [valueArc, restArc], path, getColor }) {
  const springValues = useSpring({
    from: { t: 0 },
    to: { t: 1 },
    config: { duration: 800, easing: easeQuadInOut },
  });

  return (
    <>
      <a.path
        key={valueArc.data.key}
        d={springValues.t.to(tValue =>
          path({
            ...valueArc,
            endAngle: valueArc.startAngle + (valueArc.endAngle - valueArc.startAngle) * tValue,
          })
        )}
        fill={getColor(valueArc)}
      />
      <a.path
        key={restArc.data.key}
        d={springValues.t.to(tRest =>
          path({
            ...restArc,
            startAngle: valueArc.startAngle + (valueArc.endAngle - valueArc.startAngle) * tRest,
            endAngle: Math.PI / 2,
          })
        )}
        fill={getColor(restArc)}
      />
    </>
  );
}

export function Gauge({
  value = 0,
  tickValue = 0,
  minValue = 0,
  maxValue = 100,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
}) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const centerY = 72;
  const centerX = width / 2;
  const outerRadius = Math.min(innerWidth, innerHeight) / 2.2;
  const innerRadius = outerRadius * 0.67;

  const data = useMemo(
    () => [
      { key: 'value', count: value, color: getArcColor(value, tickValue) },
      { key: 'rest', count: maxValue - value, color: 'var(--color-blue-gray-15)' },
    ],
    [value, tickValue]
  );

  return (
    <SvgRoot width={width} height={height}>
      <Group top={centerY} left={centerX}>
        <Pie
          data={data}
          pieValue={d => d.count}
          outerRadius={outerRadius - 5}
          innerRadius={innerRadius}
          startAngle={-Math.PI / 2}
          endAngle={Math.PI / 2}
          pieSort={(a, _) => (a.key === 'value' ? -1 : 1)}>
          {pie => {
            const [valueArc, restArc] = pie.arcs;

            return (
              <AnimatedArcs
                arcs={[valueArc, restArc]}
                path={pie.path}
                getColor={arc => arc.data.color}
              />
            );
          }}
        </Pie>
        {tickValue > 0 && (
          <>
            <GaugeTick
              value={tickValue}
              radius={innerRadius}
              length={outerRadius - innerRadius - 5}
              maxValue={maxValue}
            />
            <MinMaxValueLabels
              centerX={centerX}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              minValue={minValue}
              maxValue={maxValue}
            />
          </>
        )}
      </Group>
    </SvgRoot>
  );
}
const GaugeTick = ({ value, radius, length, maxValue }) => {
  const valueAngle = -Math.PI * (1 - value / maxValue);
  const startX = Math.cos(valueAngle) * radius;
  const startY = Math.sin(valueAngle) * radius - 1.5;
  const endX = Math.cos(valueAngle) * (radius + length);
  const endY = Math.sin(valueAngle) * (radius + length);
  const textOffset = 7;
  const adjustedEndX = endX + 2 * textOffset;

  return (
    <>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="var(--color-blue-gray-70)"
        strokeWidth="0.5rem"
        strokeLinecap="round"
      />
      <Valuelabel x={adjustedEndX} y={endY - textOffset / 2} fontSize="var(--font-size-xs)">
        {value}*
      </Valuelabel>
    </>
  );
};

const MinMaxValueLabels = ({ outerRadius, innerRadius, centerX, minValue, maxValue }) => {
  const labelPosition = { x: outerRadius - innerRadius, y: 30 };
  const labelOffset = 27;
  const minX = labelPosition.x - centerX + labelOffset;
  const minY = labelPosition.y;
  const maxX = centerX - labelPosition.x - labelOffset;
  const maxY = labelPosition.y;

  return (
    <>
      <Valuelabel x={minX} y={minY} fill="var(--color-blue-gray-50)">
        {minValue}
      </Valuelabel>
      <Valuelabel x={maxX} y={maxY} fill="var(--color-blue-gray-50)">
        {maxValue}
      </Valuelabel>
    </>
  );
};

const Valuelabel = props => (
  <text
    textAnchor="middle"
    fontSize="var(--font-size-xs)"
    fill="var(--color-blue-gray-70)"
    {...props}
  />
);
