import styled from 'styled-components';
import { Carousel } from '@src-v2/components/carousel';

export const CarouselContainer = styled.div`
  --carousel-item-size: 80rem;
`;

export const CarouselItem = styled(Carousel.Item)`
  height: 20rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.25rem solid black;
`;
