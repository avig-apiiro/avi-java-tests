import { Children, ReactNode, forwardRef, useRef } from 'react';
import styled from 'styled-components';
import { ChevronPagingButton } from '@src-v2/components/buttons';
import { useCarousel } from '@src-v2/hooks/use-carousel';
import { assignStyledNodes } from '@src-v2/types/styled';

type CarouselContentProps = { size: number; children: ReactNode };

const PlainCarouselContent = forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ children, ...props }: CarouselContentProps, ref) => {
    return (
      <div {...props} ref={ref}>
        {children}
      </div>
    );
  }
);

const _Carousel = styled(
  ({ slidesToShow = 1, children, ...props }: { slidesToShow?: number; children: ReactNode }) => {
    const carouselRef = useRef();
    const childrenCount = Children.count(children);
    const { atStart, atEnd, handleNext, handlePrev } = useCarousel(carouselRef, {
      size: childrenCount,
      slidesToShow,
    });

    return (
      <div {...props}>
        <Carousel.Content ref={carouselRef} size={Math.min(slidesToShow, childrenCount)}>
          {children}
        </Carousel.Content>
        {!atEnd && <ChevronPagingButton data-next onClick={handleNext} />}
        {!atStart && <ChevronPagingButton data-prev onClick={handlePrev} />}
      </div>
    );
  }
)`
  --carousel-item-size: 50rem;
  position: relative;
  width: fit-content;

  > ${ChevronPagingButton} {
    position: absolute;
    margin: auto 0;
    top: 0;
    bottom: 0;

    height: 8rem;
    width: 8rem;

    &[data-prev] {
      left: -3rem;
    }

    &[data-next] {
      right: -3rem;
    }
  }
`;

export const Carousel = assignStyledNodes(_Carousel, {
  Item: styled.div`
    flex: 0 0 var(--carousel-item-size, auto);
  `,
  Content: styled(PlainCarouselContent)`
    display: flex;
    width: calc(
      var(--carousel-item-size, 100%) * ${props => props.size} + var(--carousel-gap, 5rem) *
        (${props => props.size - 1})
    );
    scroll-behavior: smooth;
    gap: var(--carousel-gap, 5rem);
    overflow: hidden;
  `,
});
