import { useEffect, useRef } from 'react';

export const useAutoFocus = (autoFocus: boolean) => {
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
    }
  }, [autoFocus, ref.current]);

  return ref;
};
