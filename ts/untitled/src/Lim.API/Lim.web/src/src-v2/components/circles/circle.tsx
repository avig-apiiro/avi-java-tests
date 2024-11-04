import { HTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { BaseIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { StyledProps } from '@src-v2/types/styled';

export interface CircleProps {
  size?: Size;
  zIndex?: number;
}

export const Circle = styled(
  forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & StyledProps<CircleProps>>(
    ({ size, zIndex, ...props }, ref) => <div {...props} ref={ref} data-size={size} />
  )
)`
  --circle-size: 6rem;

  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: var(--circle-size);
  min-width: var(--circle-size);
  height: var(--circle-size);
  min-height: var(--circle-size);
  border-radius: 100vmax;
  color: var(--color-blue-gray-60);
  z-index: ${props => (props.zIndex !== undefined ? props.zIndex : 'unset')};
  user-select: none;

  &:hover {
    transform: ${props => (props.zIndex !== undefined ? 'scale(1.1)' : 'unset')};
    z-index: ${props => (props.zIndex !== undefined ? props.zIndex * 2 : 'unset')};
  }

  [data-size=${Size.XXXSMALL}] > &,
  &[data-size=${Size.XXXSMALL}] {
    --circle-size: 2rem;
    padding: 0.5rem;
    font-size: var(--font-size-xxs);

    ${BaseIcon} {
      --icon-size: 3rem;
    }
  }

  [data-size=${Size.XXSMALL}] > &,
  &[data-size=${Size.XXSMALL}] {
    --circle-size: 4rem;
    padding: 0.5rem;
    font-size: var(--font-size-xxs);

    ${BaseIcon} {
      --icon-size: 2.5rem;
    }
  }

  [data-size=${Size.XSMALL}] > &,
  &[data-size=${Size.XSMALL}] {
    --circle-size: 5rem;
    padding: 0.5rem;
    font-size: var(--font-size-xxs);

    ${BaseIcon} {
      --icon-size: 3.5rem;
    }
  }

  [data-size=${Size.SMALL}] > &,
  &[data-size=${Size.SMALL}] {
    --circle-size: 6rem;
    padding: 0.75rem;
    font-size: var(--font-size-xs);

    ${BaseIcon} {
      --icon-size: 4rem;
    }
  }

  [data-size=${Size.MEDIUM}] > &,
  &[data-size=${Size.MEDIUM}] {
    --circle-size: 7rem;
    padding: 0.75rem;
    font-size: var(--font-size-s);

    ${BaseIcon} {
      --icon-size: 5rem;
    }
  }

  [data-size=${Size.LARGE}] > &,
  &[data-size=${Size.LARGE}] {
    --circle-size: 8rem;
    padding: 1rem;
    font-size: var(--font-size-m);

    ${BaseIcon} {
      --icon-size: 6rem;
    }
  }

  [data-size=${Size.XLARGE}] > &,
  &[data-size=${Size.XLARGE}] {
    --circle-size: 9rem;
    padding: 0.75rem;
    font-size: var(--font-size-m);

    ${BaseIcon} {
      --icon-size: 6.5rem;
    }
  }

  [data-size=${Size.XXLARGE}] > &,
  &[data-size=${Size.XXLARGE}] {
    --circle-size: 10rem;
    padding: 1.25rem;
    font-size: var(--font-size-xl);

    ${BaseIcon} {
      --icon-size: 6rem;
    }
  }

  [data-size=${Size.XXXLARGE}] > &,
  &[data-size=${Size.XXXLARGE}] {
    --circle-size: 11rem;
    padding: 1.25rem;
    font-size: var(--font-size-xl);

    ${BaseIcon} {
      --icon-size: 6rem;
    }
  }
`;
