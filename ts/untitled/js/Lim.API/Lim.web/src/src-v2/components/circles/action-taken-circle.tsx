import { HTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';
import { StyledProps } from '@src-v2/types/styled';

export enum ActionCircleMode {
  manual = 'manual',
  automated = 'automated',
  combined = 'combined',
}

export const ActionTakenCircle = styled(
  forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement> & StyledProps<{ mode?: ActionCircleMode; size?: Size }>
  >(({ mode, ...props }, ref) => <Circle data-mode={mode} {...props} ref={ref} />)
)`
  position: relative;
  border: 0.25rem var(--color-blue-gray-30) solid;
  background-color: var(--color-white);

  &[data-mode=${ActionCircleMode.manual}] {
    border-color: var(--color-blue-60);
  }

  &[data-mode=${ActionCircleMode.automated}] {
    border-color: var(--color-green-50);
  }

  &[data-mode=${ActionCircleMode.combined}] {
    border-color: var(--color-blue-60);

    &:before {
      content: '';
      position: absolute;
      width: calc(var(--circle-size) + 1rem);
      height: calc(var(--circle-size) + 1rem);
      border: 0.25rem solid var(--color-green-50);
      border-radius: 100vmax;
    }
  }
`;
