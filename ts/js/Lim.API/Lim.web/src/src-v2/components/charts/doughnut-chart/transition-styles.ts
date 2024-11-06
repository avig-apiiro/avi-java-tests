import { PieArcDatum } from '@visx/shape/lib/shapes/Pie';

export const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});

export const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});
