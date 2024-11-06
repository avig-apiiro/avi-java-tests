import { useDrag as useDndDrag, useDrop as useDndDrop } from 'react-dnd';
import { StubAny } from '@src-v2/types/stub-any';

export function useDrag<T>({ item, type, ...props }: { item: T; type: string; canDrag: boolean }) {
  const [dragState, dragRef, previewRef] = useDndDrag(
    () => ({
      ...props,
      type,
      item,
      collect: monitor => ({
        isDragging: monitor.isDragging(),
        draggedItem: monitor.getItem(),
      }),
    }),
    [item]
  );
  return [dragRef, dragState, previewRef] as const;
}

type UseDropProps<T = StubAny> = {
  type: string;
  onDrop: (item: T) => void;
  canDrop: (item: T) => boolean;
  [key: string]: any;
};

export function useDrop<T = any>({ type, onDrop, canDrop, ...props }: UseDropProps<T>) {
  const [dropState, dropRef] = useDndDrop(
    () => ({
      ...props,
      accept: type,
      drop: (item: T) => onDrop(item),
      canDrop: (item: T) => canDrop(item),
      collect: (monitor: StubAny) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDrop]
  );

  return [dropRef, dropState] as const;
}
