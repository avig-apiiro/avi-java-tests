import { forwardRef } from 'react';
import styled from 'styled-components';
import { MotionAnimation } from '@src-v2/components/animations/motion-animation';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';

export const _LearningButton = styled(
  forwardRef<HTMLDivElement, StyledProps<{ onClick: () => void }>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        <LearningButton.Animation size={3} width={2} margin={3} />
        {children}
      </div>
    )
  )
)`
  display: inline-flex;
  padding: 0 4rem 0 2rem;
  align-items: center;
  font-size: var(--font-size-s);
  white-space: nowrap;
  border-radius: 2rem;
  cursor: pointer;
  gap: 2rem;

  &:hover {
    background-color: var(--color-blue-gray-20);
  }
`;

const Animation = styled(MotionAnimation)`
  width: 10rem;
  height: 10rem;
  padding: 2rem;
`;

export const FlatLearningButton = styled(_LearningButton)`
  height: 7rem;

  &:hover {
    background-color: var(--color-blue-gray-20);
  }

  ${Animation} {
    width: 6rem;
    height: 6rem;
    padding: 0;
    background-color: transparent;
  }
`;

export const LearningButton = assignStyledNodes(_LearningButton, {
  Animation,
});
