import _ from 'lodash';
import { forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { SvgRoot } from '@src-v2/components/svg/svg-elements';

export const MotionAnimation = forwardRef<
  SVGSVGElement,
  { size?: number; width?: number; margin?: number }
>(({ size = 7, width = 7, margin = 5, ...props }, ref) => {
  const dimension = useMemo(
    () => (size * 2 + 1) * width + size * 2 * margin,
    [size, width, margin]
  );
  return (
    <SvgRoot {...props} ref={ref} width={dimension} height={dimension}>
      {_.range(size * -1, size + 1).map((value, index) => (
        <Rect
          key={value}
          width={width}
          rx={width / 2}
          x={(width + margin) * index}
          delay={`${1.2 * ((size - Math.abs(value)) / size) + 0.2}s`}
        />
      ))}
    </SvgRoot>
  );
});

const Rect = styled.rect`
  height: 20%;
  transform: translateY(35%);
  fill: var(--color-green-45);
  animation: line-stretch 2.5s ${(props: { delay: string }) => props.delay ?? 0} infinite linear;

  @keyframes line-stretch {
    0% {
      height: 20%;
      transform: translateY(35%);
    }
    50% {
      height: 100%;
      transform: translateY(0);
    }
    100% {
      height: 20%;
      transform: translateY(35%);
    }
  }
`;
