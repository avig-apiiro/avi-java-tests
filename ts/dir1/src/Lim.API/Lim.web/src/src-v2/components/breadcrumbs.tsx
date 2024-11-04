import { Children } from 'react';
import styled from 'styled-components';
import { BaseIcon } from '@src-v2/components/icons';
import { NavLink } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';

export const Breadcrumbs = styled(({ children, ...props }: StyledProps) => {
  return (
    <nav {...props}>
      {Children.map(children, (child, index) => [
        child,
        child && <Divider key={`icon.${index}`}>/</Divider>,
      ])}
    </nav>
  );
})`
  display: flex;
  align-items: center;
  font-size: var(--font-size-s);
  font-weight: 300;
  line-height: 1.3;

  > ${NavLink} {
    &:hover {
      text-decoration: underline;
    }

    &:first-of-type {
      pointer-events: none;
    }
  }

  > ${BaseIcon} {
    width: 5rem;
    height: 5rem;
    margin: 0 3rem 0 1rem;
    flex-shrink: 0;
  }
`;

export const Divider = styled.span`
  color: var(--color-blue-gray-40);
  margin: 0 2rem;

  &:last-of-type {
    display: none;
  }
`;
