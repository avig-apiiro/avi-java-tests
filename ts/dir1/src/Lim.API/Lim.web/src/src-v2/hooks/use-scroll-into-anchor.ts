import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollIntoAnchor(delay = 200, deps: any[] = []) {
  const { hash } = useLocation();
  useLayoutEffect(() => {
    const anchorName = hash.substring(1);
    if (anchorName) {
      const element = document.querySelector(`a[name="${anchorName}"]`);
      setTimeout(() => element?.scrollIntoView({ behavior: 'smooth' }), delay);
    }
  }, [hash, ...deps]);
}
