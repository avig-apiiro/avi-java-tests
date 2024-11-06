import { useCallback, useEffect, useState } from 'react';
import { StubAny } from '@src-v2/types/stub-any';

export function useCarousel(carouselRef: StubAny, { size = 0, slidesToShow = 1 }) {
  const [position, setPosition] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  const getWidth = () =>
    size
      ? (carouselRef.current?.childNodes[0]?.offsetWidth ?? 0) +
        parseInt(getComputedStyle(carouselRef.current).gap)
      : 0;

  const updateAtEnd = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth;
      const { scrollWidth } = carouselRef.current;
      setAtEnd(position >= size - slidesToShow || scrollWidth <= containerWidth);
    }
  };

  const handleNext = useCallback(() => {
    if (position === size - slidesToShow) {
      carouselRef.current.scrollLeft = 0;
      setPosition(0);
    } else {
      carouselRef.current.scrollLeft = getWidth() * (position + 1);
      setPosition(position + 1);
    }
    updateAtEnd();
  }, [carouselRef.current, position]);

  const handlePrev = useCallback(() => {
    if (position === 0) {
      const lastPosition = Math.max(size - slidesToShow, 0);
      carouselRef.current.scrollLeft = getWidth() * lastPosition;
      setPosition(lastPosition);
    } else {
      carouselRef.current.scrollLeft = getWidth() * (position - 1);
      setPosition(position - 1);
    }
    updateAtEnd();
  }, [carouselRef.current, position]);

  useEffect(() => {
    updateAtEnd();
  }, [position, size, slidesToShow, carouselRef.current]);

  return {
    atStart: position === 0,
    atEnd,
    handlePrev,
    handleNext,
  };
}
