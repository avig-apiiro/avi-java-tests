import styled from 'styled-components';
import { Card } from '@src-v2/components/cards/cards';
import { assignStyledNodes } from '@src-v2/types/styled';

export const _RibbonCard = styled(Card)`
  display: flex;
  padding: 4rem;
  flex-direction: column;
  justify-content: space-between;
  gap: 4rem;
  background: linear-gradient(
    var(--card-ribbon-angle, 0deg),
    var(--card-ribbon-color, var(--color-blue-gray-20)) 0%,
    var(--card-ribbon-color, var(--color-blue-gray-20)) var(--card-ribbon-size, 9rem),
    var(--color-white) var(--card-ribbon-size, 9rem),
    var(--color-white) 100%
  );
`;

const Ribbon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4rem;
`;

export const RibbonCard = assignStyledNodes(_RibbonCard, {
  Ribbon,
});
