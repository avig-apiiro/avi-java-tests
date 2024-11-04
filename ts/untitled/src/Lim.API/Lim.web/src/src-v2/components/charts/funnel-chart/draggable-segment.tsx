import { ReactNode, Ref } from 'react';
import { Segment } from '@src-v2/components/charts/funnel-chart/funnel-chart';
import { useDrag, useDrop } from '@src-v2/hooks/drag-and-drop';

export function DraggableSegment<
  TDropRef extends HTMLElement = HTMLDivElement,
  TDragRef extends HTMLElement = HTMLImageElement,
>({
  segment,
  onHover,
  onDrop,
  children,
}: {
  segment: Segment;
  onHover: (dragSegmentKey: string, hoverSegmentKey: string) => void;
  onDrop: (droppedSegmentKey: string) => void;
  children: (dragRef: Ref<TDragRef>, dropRef: Ref<TDropRef>, isDropzone: boolean) => ReactNode;
}) {
  const [dragRef, , previewRef] = useDrag({
    item: { dragItemKey: segment.key },
    type: 'funnel-segment',
    canDrag: segment.draggable,
  });

  const [dropRef, dropState] = useDrop({
    type: 'funnel-segment',
    hover: ({ dragItemKey }) => onHover(dragItemKey, segment.key),
    onDrop: ({ dragItemKey }) => onDrop(dragItemKey),
    canDrop: () => segment.draggable,
  });

  return (
    <>
      {children(
        dragRef,
        (ref: HTMLElement) => dropRef(previewRef(ref)),
        segment.draggable && dropState.isOver
      )}
    </>
  );
}
