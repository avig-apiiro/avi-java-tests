import { ReactNode } from 'react';
import styled from 'styled-components';
import { Card } from '@src-v2/components/cards/index';
import { BaseIcon } from '@src-v2/components/icons';
import { Heading, Paragraph } from '@src-v2/components/typography';

type SelectionCardProps = {
  disabled?: boolean;
  to?: string;
  button?: ReactNode;
  children: ReactNode;
};

export function SelectionCard({ button, children, ...props }: SelectionCardProps) {
  return (
    <Container {...props}>
      <Content>{children}</Content>
      {button}
    </Container>
  );
}

const Container = styled(Card)`
  display: flex;
  margin-bottom: 5rem;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => (props.to ? 'var(--color-white)' : 'var(--color-blue-gray-30)')};

  > ${BaseIcon} {
    width: 8rem;
    height: 8rem;
    padding: 2rem;
    border-radius: 100vmax;
    background-color: ${props =>
      props.to ? 'var(--color-blue-gray-20)' : 'var(--color-blue-gray-30)'};
    cursor: pointer;
  }

  ${Heading} {
    font-size: 1em;
    font-weight: 600;
    color: ${props => (props.to ? 'var(--color-blue-gray-70)' : 'var(--color-blue-gray-55)')};
  }

  ${Paragraph} {
    font-weight: 300;
    color: var(--color-blue-gray-50);
  }
`;

const Content = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: flex-start;
`;
