import { ParentSize } from '@visx/responsive';
// @ts-expect-error
import { area, curveBumpX } from 'd3-shape';
import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import FunnelSkeletonUrl from '@src-v2/assets/images/funnel-skeleton.svg';
import { Skeleton } from '@src-v2/components/animations/skeleton';
import { DraggableSegment } from '@src-v2/components/charts/funnel-chart/draggable-segment';
import { SegmentHeader } from '@src-v2/components/charts/funnel-chart/segment-header';
import {
  SegmentPopoverContent,
  SegmentTooltip,
} from '@src-v2/components/charts/funnel-chart/segment-tooltip';
import { BaseIcon } from '@src-v2/components/icons';
import { useD3Scale } from '@src-v2/hooks';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export interface Segment {
  key: string;
  draggable: boolean;
  label: ReactNode;
  popoverLabel?: ReactNode;
  data: Record<string, number>;
  type?: string;
}

type SegmentContainerProps = {
  size: number;
  placement?: number;
  readOnly: boolean;
};

type FunnelProps = {
  selectedSegmentIndex: number;
  getSegmentLocation: (key: string) => number;
  segments: Segment[];
  colors: string[];
  isLoading?: boolean;
  paddingVertical?: number;
  curve?: any;
  onSegmentClick?: (segmentIndex: number, segment: Segment) => void;
  onPopoverClick?: (segmentIndex: number, riskLevel: string) => void;
  onSegmentRemoved?: (segmentIndex: number) => void;
  onSegmentDragged?: (dragItemKey: string, hoverItemKey: string) => void;
  onSegmentDropped?: () => void;
  readOnly: boolean;
} & Omit<StyledProps, 'children'>;

export const FunnelChart = (props: FunnelProps) => (
  <ParentSize>
    {({ width, height }) =>
      props.segments?.length ? (
        <PlainFunnel {...props} width={width} height={height} />
      ) : (
        <Skeleton.Svg style={{ height }} svgUrl={FunnelSkeletonUrl} />
      )
    }
  </ParentSize>
);

function PlainFunnel({
  selectedSegmentIndex,
  getSegmentLocation,
  segments,
  width,
  height,
  colors,
  readOnly,
  isLoading,
  paddingVertical = 85,
  curve = curveBumpX,
  onSegmentClick,
  onSegmentRemoved,
  onSegmentDragged,
  onSegmentDropped,
  onPopoverClick,
  ...props
}: FunnelProps & {
  width: number;
  height: number;
}) {
  const data = segments
    .filter(segment => Boolean(segment.data))
    .map(segment => Object.values(segment.data));
  const { totalMax, totalAreas, values } = useNormalizeValues(data);

  const [x, y] = useD3Scale({
    width,
    height: height - paddingVertical,
    maxX: segments.length,
    maxY: totalMax,
  });

  const chartArea = useMemo(
    () =>
      area()
        .curve(curve)
        // @ts-expect-error
        .x((d, i) => x(i))
        .y0(d => y(d[0]))
        .y1(d => y(d[1])),
    [x, y]
  );

  const partSize = 100 / totalAreas;

  return (
    <Container style={{ width }} {...props}>
      {values.map((segmentValues, sIndex, allSegments) => (
        <DraggableSegment
          key={sIndex}
          segment={segments[sIndex]}
          onHover={onSegmentDragged}
          onDrop={onSegmentDropped}>
          {(dragRef, dropRef, isDropzone) => (
            <SegmentContainer
              ref={dropRef}
              size={partSize}
              readOnly={readOnly}
              placement={getSegmentLocation(segments[sIndex].key) ?? 0}
              data-dropzone={dataAttr(isDropzone)}
              data-loading={dataAttr(isLoading)}
              data-selected-scope={dataAttr(selectedSegmentIndex >= sIndex)}
              data-selected={dataAttr(selectedSegmentIndex === sIndex)}
              onClick={onSegmentClick ? () => onSegmentClick(sIndex, segments[sIndex]) : null}>
              <SegmentHeader
                ref={dragRef}
                segmentIndex={sIndex}
                segment={segments[sIndex]}
                draggable={sIndex > 0 && !readOnly}
                totalMax={totalMax}
                onSegmentRemoved={!readOnly ? onSegmentRemoved : null}
              />
              <SegmentTooltip
                interactive={Boolean(onPopoverClick)}
                content={
                  <SegmentPopoverContent
                    sIndex={sIndex}
                    segment={segments[sIndex]}
                    colors={colors}
                    onPopoverClick={onPopoverClick}
                  />
                }>
                <SegmentArea>
                  {segmentValues.map((path, pIndex) => (
                    <path
                      key={pIndex}
                      // @ts-expect-error
                      d={chartArea([path, allSegments[sIndex + 1]?.[pIndex] ?? path])}
                      fill={colors[pIndex]}
                      stroke={colors[pIndex]}
                    />
                  ))}
                </SegmentArea>
              </SegmentTooltip>
            </SegmentContainer>
          )}
        </DraggableSegment>
      ))}
    </Container>
  );
}

function useNormalizeValues(data: number[][]) {
  return useMemo(() => {
    const totalValues = data.map(values => values.reduce((sum, value) => sum + value, 0));
    const totalMax = Math.max(...totalValues);
    const totalAreas = data.length;
    const normalized = totalValues.map((total, index) => {
      let lastPoint = (totalMax - total) / 2;
      return data[index].map(value => [totalMax - lastPoint, totalMax - (lastPoint += value)]);
    });

    return {
      totalMax,
      totalAreas,
      values: normalized,
    };
  }, [data]);
}

const Container = styled.div`
  display: flex;
  height: 35rem;
`;

export const SegmentContainer = styled.div<SegmentContainerProps>`
  display: flex;
  flex: 1;
  order: ${props => props.placement ?? 0};
  width: ${props => `calc(${props.size}% - 2rem)`};
  padding: 1rem;
  flex-direction: column;
  transition: background-color 100ms ease-in-out;
  cursor: pointer;
  border-radius: 1rem;

  &[data-selected-scope] {
    &:not(:first-of-type) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    &:not([data-selected]) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    background-color: ${props => (props.readOnly ? 'unset' : 'var(--color-blue-gray-20)')};
  }

  &[data-dropzone] {
    opacity: 0.4;
  }

  &[data-loading] {
    pointer-events: none;

    path {
      animation: loading-colors 2s infinite ease-in-out;
    }
  }

  &:hover {
    background-color: var(--color-blue-gray-15);

    &[data-selected-scope] {
      background-color: var(--color-blue-gray-25);
    }
  }

  ${BaseIcon}[data-name='Close'] {
    opacity: 1;
  }

  @keyframes loading-colors {
    0% {
      fill: var(--color-blue-gray-30);
      stroke: var(--color-blue-gray-30);
    }

    50% {
      fill: var(--color-blue-gray-10);
      stroke: var(--color-blue-gray-10);
    }

    100% {
      fill: var(--color-blue-gray-30);
      stroke: var(--color-blue-gray-30);
    }
  }
`;

const SegmentArea = styled.svg`
  flex-grow: 1;
  width: 100%;
`;
