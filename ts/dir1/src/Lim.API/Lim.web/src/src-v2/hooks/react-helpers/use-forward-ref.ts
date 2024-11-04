import { MutableRefObject, useLayoutEffect, useRef } from 'react';

export function useForwardRef<T>(forwardRef: MutableRefObject<T> | ((ref: T) => void)) {
  const targetRef = useRef<T>();

  useLayoutEffect(() => {
    if (!forwardRef) {
      return;
    }
    if (typeof forwardRef === 'function') {
      forwardRef(targetRef.current);
    } else {
      forwardRef.current = targetRef.current;
    }
  }, [forwardRef]);

  return targetRef;
}
