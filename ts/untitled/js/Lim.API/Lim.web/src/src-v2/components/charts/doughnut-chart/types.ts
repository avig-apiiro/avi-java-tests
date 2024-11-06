import { SpringValue } from '@react-spring/web';
import { PieArcDatum, ProvidedProps } from '@visx/shape/lib/shapes/Pie';
import { Arc } from 'd3-shape';

export interface DoughnutData {
  key: string;
  count: number;
}

export interface DoughnutProps<Datum> {
  data: DoughnutData[];
  dataLabels: Record<string, string>;
  onClick: (arc: PieArcDatum<Datum>) => void;
  getArcColor: (arcLabel: string) => string;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export interface AnimatedStyles {
  startAngle: number;
  endAngle: number;
  opacity: number;
}

export interface AnimatedPieProps<Datum> extends ProvidedProps<Datum> {
  getKey: (d: PieArcDatum<Datum>) => string;
  getArcColor: (d: PieArcDatum<Datum>) => string;
  onHoverDatum: (d: PieArcDatum<Datum>) => void;
  onLeaveDatum: () => void;
  onClickDatum: (arc: PieArcDatum<Datum>) => void;
  isDatumSelected: (d: PieArcDatum<Datum>) => boolean;
  delay?: number;
}

export interface AnimationProps {
  endAngle: SpringValue<number>;
  startAngle: SpringValue<number>;
  opacity: SpringValue<number>;
}

export interface AnimatedArcProps<Datum> {
  arc: PieArcDatum<Datum>;
  animationProps: AnimationProps;
  path: Arc<any, PieArcDatum<Datum>>;
  getArcColor: (arc: PieArcDatum<Datum>) => string;
  onHoverDatum: (arc: PieArcDatum<Datum>) => void;
  onLeaveDatum: () => void;
  onClickDatum: (arc: PieArcDatum<Datum>) => void;
  isDatumSelected: (arc: PieArcDatum<Datum>) => boolean;
}
