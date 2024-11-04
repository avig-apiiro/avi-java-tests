import { HTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles/circle';
import { Size } from '@src-v2/components/types/enums/size';
import { StyledProps } from '@src-v2/types/styled';

export const CircleGroup = styled(
  forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & StyledProps<{ size: Size | string }>>(
    ({ size = Size.XSMALL, ...props }, ref) => {
      return <div {...props} ref={ref} data-size={size} />;
    }
  )
)`
  display: flex;

  &[data-size=${Size.XSMALL}] ${Circle}:not(:first-of-type) {
    margin-left: -1rem;
  }

  &[data-size=${Size.SMALL}] ${Circle}:not(:first-of-type) {
    margin-left: -1.5rem;
  }

  &[data-size=${Size.MEDIUM}] ${Circle}:not(:first-of-type) {
    margin-left: -1.5rem;
  }

  &[data-size=${Size.LARGE}] ${Circle}:not(:first-of-type) {
    margin-left: -2rem;
  }

  &[data-size=${Size.XLARGE}] ${Circle}:not(:first-of-type) {
    margin-left: -2.5rem;
  }

  &[data-size=${Size.XXLARGE}] ${Circle}:not(:first-of-type) {
    margin-left: -3rem;
  }
`;
