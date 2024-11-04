import { useTransition } from '@react-spring/web';
import { PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { AnimatedArc } from '@src-v2/components/charts/doughnut-chart/animated-arc';
import {
  enterUpdateTransition,
  fromLeaveTransition,
} from '@src-v2/components/charts/doughnut-chart/transition-styles';
import { AnimatedPieProps, AnimatedStyles } from '@src-v2/components/charts/doughnut-chart/types';

export function AnimatedDoughnut<Datum>({
  arcs,
  path,
  getKey,
  getArcColor,
  onHoverDatum,
  onLeaveDatum,
  onClickDatum,
  isDatumSelected,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: fromLeaveTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: fromLeaveTransition,
    keys: getKey,
  });

  return transitions((animationProps, arc) => (
    <AnimatedArc
      key={getKey(arc)}
      arc={arc}
      animationProps={animationProps}
      path={path}
      getArcColor={getArcColor}
      onHoverDatum={onHoverDatum}
      onLeaveDatum={onLeaveDatum}
      onClickDatum={onClickDatum}
      isDatumSelected={isDatumSelected}
    />
  ));
}
