import { MouseEvent, useCallback } from 'react';

export function useMouseDrag<T extends HTMLElement = HTMLElement>(
  dragHandler: (moveEvent: MouseEvent<T>, downEvent: MouseEvent<T>) => void,
  dependencies?: any[],
  onDragEnd?: () => void
) {
  const handleMouseMove = useCallback(dragHandler, dependencies);
  return useCallback(
    (downEvent: MouseEvent<T>) => {
      if (downEvent.button === 0) {
        const boundHandler = (moveEvent: MouseEvent<T>) => handleMouseMove(moveEvent, downEvent);
        const handleMouseUp = () => {
          // @ts-expect-error
          window.removeEventListener('mousemove', boundHandler);
          window.removeEventListener('mouseup', handleMouseUp);

          onDragEnd?.();
        };
        // @ts-expect-error
        window.addEventListener('mousemove', boundHandler);
        window.addEventListener('mouseup', handleMouseUp);
        downEvent.persist();
      }
    },
    [handleMouseMove, onDragEnd]
  );
}
