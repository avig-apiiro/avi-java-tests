import { SvgRoot } from '@src-v2/components/svg/svg-elements';

type SvgArrowProps = {
  width?: number;
  height?: number;
  stroke?: number;
};

export function SvgArrow({ width = 24, height = 12, stroke = 1.1, ...props }: SvgArrowProps) {
  const midHeight = height / 2;
  const midStroke = stroke / 2;
  return (
    <SvgRoot width={width} height={height} {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={stroke}>
        <line x1={width - stroke} y1={midHeight} x2={midStroke} y2={midHeight} />
        <polyline
          points={[
            [width * 0.7354166666666666, midStroke],
            [width - stroke * 0.6818181818181818, midHeight],
            [width * 0.7354166666666666, height - midStroke],
          ].join(' ')}
        />
      </g>
    </SvgRoot>
  );
}
