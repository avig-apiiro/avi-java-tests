import styled from 'styled-components';
import { BaseIcon } from '@src-v2/components/icons';
import { Light } from '@src-v2/components/typography';

export const EvidenceContainer = styled.div`
  padding: 3rem;
  border-radius: 3rem;
  border: 1px solid var(--color-blue-gray-20);

  &:not(:last-child) {
    margin-bottom: 4rem;
  }
`;

export const EvidenceContainerWithoutBorder = styled(EvidenceContainer)`
  border: none;
  padding: 0;
`;

export const EvidenceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  &:not(:last-child) {
    margin-bottom: 2rem;
  }

  ${Light} {
    min-width: 37.5rem;
  }

  ${BaseIcon}[data-name='Success'] {
    color: var(--color-blue-gray-40);
  }
`;

export const EvidenceSection = styled.div`
  position: relative;

  &:not(:last-child) {
    padding-bottom: 4rem;
    margin-bottom: 4rem;
    border-bottom: 0.25rem solid var(--color-blue-gray-20);
  }

  > ${Light} {
    display: inline-block;
    margin-bottom: 1rem;
  }
`;
