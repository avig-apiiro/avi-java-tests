import styled from 'styled-components';
import { Card } from '@src-v2/components/cards';
import { Circle } from '@src-v2/components/circles';

export const RibbonRow = styled(Card)`
  position: relative;
  display: flex;
  height: 15rem;
  padding: 0 3rem;
  flex-direction: row;
  align-items: center;
  border: 0.125rem solid var(--color-blue-gray-30);
  border-radius: 3rem;
  background: linear-gradient(
    125deg,
    var(--row-ribbon-color, var(--color-blue-30)) 0%,
    var(--row-ribbon-color, var(--color-blue-30)) var(--row-ribbon-size, 4.5rem),
    var(--row-background-color, var(--color-white)) var(--row-ribbon-size, 4.5rem),
    var(--row-background-color, var(--color-white)) 100%
  );
  transition:
    box-shadow 200ms,
    background-color 200ms;
  margin-bottom: 2rem;

  &[data-selected] {
    --row-background-color: var(--color-blue-25);

    > ${Circle}:first-child {
      background-color: transparent;
      border-color: transparent;
    }
  }

  &[data-status='success'] {
    --row-ribbon-color: var(--color-green-40);
  }

  &[data-status='failure'] {
    --row-ribbon-color: var(--color-red-45);
  }

  > ${Circle}:first-child {
    background-color: var(--color-white);
  }
`;
