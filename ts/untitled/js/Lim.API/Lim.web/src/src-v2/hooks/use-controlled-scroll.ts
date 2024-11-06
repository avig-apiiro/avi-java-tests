import { MutableRefObject, useEffect, useState } from 'react';
import { useResizeObserver } from '@src-v2/hooks/dom-events/use-resize-observer';

export const useControlledHorizontalScroll = (
  containerRef: MutableRefObject<HTMLElement | null>,
  gap: number,
  scrollOffset: number = 0
) => {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const handleScroll = () => {
    const container = containerRef.current;
    setShowLeftScroll(container.scrollLeft > scrollOffset);
    setShowRightScroll(
      container.scrollLeft < container.scrollWidth - container.clientWidth - scrollOffset
    );
    container.addEventListener('resize', handleScroll);
  };

  useResizeObserver(containerRef, handleScroll);

  const scrollLeft = () => {
    containerRef.current.scrollBy({ left: -gap, behavior: 'smooth' });
  };

  const scrollRight = () => {
    containerRef.current.scrollBy({ left: gap, behavior: 'smooth' });
  };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return { showLeftScroll, showRightScroll, scrollLeft, scrollRight };
};
