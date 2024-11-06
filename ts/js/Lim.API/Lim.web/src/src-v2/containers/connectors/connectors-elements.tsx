import styled from 'styled-components';
import { CardTiles } from '@src-v2/components/cards';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Gutters } from '@src-v2/components/layout';
import { Heading, Paragraph } from '@src-v2/components/typography';

export const ConnectorsLayout = styled(Gutters)`
  display: flex;
  margin: 6rem 0;
  flex-direction: column;
  gap: 6rem;
`;

export const ConnectorsSection = styled.section`
  position: relative;

  > a[name] {
    position: absolute;
    top: -20rem;
  }

  > ${Heading} {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0;
  }

  > ${Paragraph} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--color-blue-gray-60);
    font-size: var(--font-size-m);
    font-weight: 300;
    margin: 0;
  }

  ${CardTiles} {
    margin-top: 4rem;
  }
`;

export const ConnectorsModal = styled(ConfirmationModal)`
  ${Heading} {
    font-weight: 400;
    font-size: 4rem;
  }
`;
