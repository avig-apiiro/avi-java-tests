import { UIEventHandler, useCallback } from 'react';
import { useToggle } from '@src-v2/hooks';

export function useDetectScrolling() {
  const [scrolled, toggleScrolled] = useToggle(false);

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
    event => {
      const target = event.currentTarget;
      const newScrolled = target.scrollTop > 0;
      if (newScrolled !== scrolled) {
        toggleScrolled(newScrolled);
      }
    },
    [scrolled, toggleScrolled]
  );

  return [scrolled, handleScroll] as const;
}
