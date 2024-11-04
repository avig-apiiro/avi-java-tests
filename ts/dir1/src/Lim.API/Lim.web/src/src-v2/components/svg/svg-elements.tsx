import { ReactNode, forwardRef } from 'react';
import styled from 'styled-components';

type SvgRootProps = { width: number; height: number; children: ReactNode };
type HtmlRootProps = { x: number; y: number; width: number; height: number };

export const SvgRoot = forwardRef<SVGSVGElement, SvgRootProps>(
  ({ width, height, ...props }, ref) => (
    <svg
      ref={ref}
      {...props}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    />
  )
);

export const HtmlRoot = styled(
  forwardRef<HTMLDivElement, HtmlRootProps>(({ x, y, width, height, ...props }, ref) => (
    <ForeignObject x={x} y={y} width={width} height={height}>
      <div ref={ref} {...props} />
    </ForeignObject>
  ))
)`
  position: fixed;
  width: max-content;
`;

const ForeignObject = styled.foreignObject`
  transition: all 400ms;
  overflow: visible;
`;
