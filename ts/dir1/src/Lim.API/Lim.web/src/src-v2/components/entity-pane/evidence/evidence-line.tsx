import { ReactNode } from 'react';
import styled from 'styled-components';
import { Light, ListItem } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';

export const EvidenceLine = styled(
  ({
    label,
    children,
    isExtendedWidth = false,
    ...props
  }: StyledProps<{
    label: ReactNode;
    isExtendedWidth?: boolean;
  }>) => (
    <div {...props}>
      <Light>
        {label}
        {isExtendedWidth ? '' : ':'}
      </Light>
      {children}
    </div>
  )
)`
  display: flex;
  align-items: flex-start;
  line-height: 6rem;
  gap: 1rem;

  &:not(:last-child) {
    margin-bottom: ${props => (props.isExtendedWidth ? '0' : '4rem')};
  }

  > ${Light} {
    min-width: ${props => (props.isExtendedWidth ? '40rem' : 'fit-content')};
    display: flex;
    flex: 0;
  }

  > ${ListItem} {
    display: flex;
  }

  h2 {
    font-size: var(--font-size-m);
  }

  pre {
    font-size: var(--font-size-xs);
  }
`;

export const CenteredEvidenceLine = styled(EvidenceLine)`
  align-items: center;
`;

export const EvidenceLinesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;
