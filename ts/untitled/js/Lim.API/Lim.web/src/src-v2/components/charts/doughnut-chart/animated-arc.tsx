import { animated, to, useSpring } from '@react-spring/web';
import styled from 'styled-components';
import { AnimatedArcProps } from '@src-v2/components/charts/doughnut-chart/types';
import { dataAttr } from '@src-v2/utils/dom-utils';

export function AnimatedArc<Datum>({
  arc,
  animationProps,
  path,
  getArcColor,
  onHoverDatum,
  onLeaveDatum,
  onClickDatum,
  isDatumSelected,
}: AnimatedArcProps<Datum>) {
  const animation = useSpring({
    scale: isDatumSelected(arc) ? 1.1 : 1,
  });

  return (
    <AnimationGroup style={animation}>
      <AnimationPath
        data-selected={dataAttr(isDatumSelected(arc))}
        d={to([animationProps.startAngle, animationProps.endAngle], (startAngle, endAngle) =>
          path({
            ...arc,
            startAngle,
            endAngle,
          })
        )}
        fill={getArcColor(arc)}
        onMouseEnter={() => onHoverDatum(arc)}
        onMouseLeave={onLeaveDatum}
        onClick={() => onClickDatum(arc)}
      />
    </AnimationGroup>
  );
}

const AnimationGroup = styled(animated.g)``;

const AnimationPath = styled(animated.path)`
  cursor: pointer;
`;
