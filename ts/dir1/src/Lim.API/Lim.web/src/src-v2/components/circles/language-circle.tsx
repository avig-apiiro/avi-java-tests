import { HTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Circle, CircleProps } from '@src-v2/components/circles/circle';
import { LanguageIcon } from '@src-v2/components/icons';
import { StyledProps } from '@src-v2/types/styled';

interface LanguageCircleProps extends CircleProps {
  name: string;
}

export const LanguageCircle = styled(
  forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & StyledProps<LanguageCircleProps>>(
    ({ name, size, ...props }, ref) => (
      <Circle {...props} size={size} ref={ref}>
        <LanguageIcon name={name} />
      </Circle>
    )
  )
)`
  background-color: var(--color-blue-30);
  border: 0.4rem solid var(--color-white);
`;
