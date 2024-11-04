import styled from 'styled-components';
import { RibbonCard } from '@src-v2/components/cards/ribbon-card';
import { Circle, CircleGroup } from '@src-v2/components/circles';
import { assignStyledNodes } from '@src-v2/types/styled';

export const _CorneredCard = styled(RibbonCard)`
  --card-ribbon-angle: 132deg;
  --card-ribbon-size: 15rem;
  background: var(--color-white);
`;

const VerticalStack = styled(_CorneredCard)`
  flex-direction: row;

  ${CircleGroup} {
    display: flex;
    flex-direction: column;

    ${Circle}:not(:first-of-type) {
      margin-top: -2rem;
      margin-left: unset;
    }
  }
`;

export const CorneredCard = assignStyledNodes(_CorneredCard, {
  VerticalStack,
});
