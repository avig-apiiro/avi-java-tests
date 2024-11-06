type MarkerArrowProps = {
  width: number;
  height: number;
  refX?: number;
};

export function MarkerArrow({ width, height, refX, ...props }: MarkerArrowProps) {
  return (
    <marker
      {...props}
      refX={(refX ?? 0) - 10}
      refY={height}
      markerWidth={width}
      markerHeight={height}
      viewBox={[0, 0, width * 2, height * 2].join(' ')}
      orient="auto-start-reverse">
      <polygon
        points={[
          [0, 0],
          [0, height * 2],
          [width * 2, height],
        ].join(' ')}
      />
    </marker>
  );
}
