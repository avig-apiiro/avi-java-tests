import { Meta } from '@storybook/react';
import { Carousel as CarouselCmp } from '@src-v2/components/carousel';
import { CarouselContainer, CarouselItem } from './helper';

export default {
  title: 'Components/Carousel',
  component: CarouselCmp,
  argTypes: {
    to: { type: { name: 'string' } },
    href: { type: { name: 'string' } },
  },
} as Meta;

const CarouselTemplate = args => (
  <CarouselContainer>
    <CarouselCmp {...args}>
      {[
        <CarouselItem>This</CarouselItem>,
        <CarouselItem>is</CarouselItem>,
        <CarouselItem>carousel</CarouselItem>,
        <CarouselItem>with</CarouselItem>,
        <CarouselItem>basic</CarouselItem>,
        <CarouselItem>style</CarouselItem>,
      ]}
    </CarouselCmp>
  </CarouselContainer>
);
export const Carousel = CarouselTemplate.bind({});
Carousel.args = {
  slidesToShow: 4,
};
