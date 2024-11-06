import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import styled from 'styled-components';
import { Circle, CircleProps } from '@src-v2/components/circles/circle';
import { VendorIcon } from '@src-v2/components/icons';
import { StyledProps } from '@src-v2/types/styled';

export enum VendorState {
  Error = 'error',
  Warning = 'warning',
  Attention = 'attention',
  Success = 'success',
}

interface VendorCircleProps extends CircleProps {
  name: string;
  state?: VendorState;
  fallback?: ReactNode;
}

export const VendorCircle = styled(
  forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & StyledProps<VendorCircleProps>>(
    ({ name, size, state, fallback, ...props }, ref) => (
      <Circle {...props} size={size} ref={ref} data-state={state}>
        <VendorIcon name={name} size={size} fallback={fallback} />
      </Circle>
    )
  )
)`
  background-color: var(--color-white);
  border: 0.25rem solid var(--color-blue-gray-30);

  &:after {
    content: '';
    position: absolute;
    width: calc(var(--circle-size) + 1rem);
    height: calc(var(--circle-size) + 1rem);
    border-radius: 100vmax;
  }

  &:before {
    content: '';
    position: absolute;
    width: calc(var(--circle-size) + 2rem);
    height: calc(var(--circle-size) + 2rem);
    border-radius: 100vmax;
  }

  &[data-state] {
    &:after {
      border: 0.5rem solid var(--color-white);
    }
  }

  &[data-state=${VendorState.Error}] {
    &:before {
      border: 0.5rem solid var(--color-red-50);
    }
  }

  &[data-state=${VendorState.Warning}] {
    &:before {
      border: 0.5rem solid var(--color-orange-55);
    }
  }

  &[data-state=${VendorState.Attention}] {
    &:before {
      border: 0.5rem solid var(--color-blue-gray-50);
    }
  }
`;
