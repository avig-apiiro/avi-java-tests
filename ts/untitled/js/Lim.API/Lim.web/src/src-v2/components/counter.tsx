import styled from 'styled-components';

export const Counter = styled.span`
  height: 4rem;
  padding: 0 1rem;
  align-self: center;
  font-size: var(--font-size-xs);
  font-weight: 600;
  white-space: nowrap;
  line-height: 3.5rem;
  color: var(--color-blue-gray-60);
  border-radius: 100vmax;
  border: 0.25rem solid var(--color-blue-gray-25);
  background-color: var(--color-blue-gray-10);

  &:hover {
    background-color: var(--color-blue-gray-20);
  }
`;
