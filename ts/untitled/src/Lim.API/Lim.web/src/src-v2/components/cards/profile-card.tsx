import styled from 'styled-components';
import { Card } from '@src-v2/components/cards/cards';
import { Subtitle, Title } from '@src-v2/components/typography';

export const ProfileCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  gap: 16rem;

  &[data-calculating] {
    gap: 2rem;
  }

  ${Title} {
    margin-bottom: 3rem;
    font-size: var(--font-size-xxl);
    font-weight: 500;
  }

  ${Subtitle} {
    font-size: var(--font-size-s);
    font-weight: 300;
  }
`;
