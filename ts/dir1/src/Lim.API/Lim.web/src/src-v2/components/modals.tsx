import { ReactNode, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Heading1, SubHeading3 } from '@src-v2/components/typography';
import { useDetectEscapePress } from '@src-v2/hooks/dom-events/use-detect-escape-press';
import { assignStyledNodes } from '@src-v2/types/styled';

type ModalProps = {
  appendTo?: string;
  onClose: (event) => void;
  children: ReactNode;
};

function BaseModal({ appendTo = 'modal', onClose, ...props }: ModalProps) {
  const ref = useRef();

  useDetectEscapePress(onClose);

  return ReactDOM.createPortal(
    <Container ref={ref} {...props} />,
    document.getElementById(appendTo)
  );
}

const Container = styled.div`
  margin: 0 auto;
  background-color: var(--color-white);
  box-shadow: var(--elevation-8);
`;

const Title = styled(Heading1)`
  flex-grow: 1;
`;

const Header = styled.header`
  display: flex;
  padding: 4rem;
  align-items: flex-start;
  justify-content: space-between;
  border-radius: 1rem 1rem 0 0;

  &:empty {
    display: none;
  }
`;

const Content = styled.section`
  position: relative;
  padding: 8rem;
  border-radius: 1rem;
  flex-grow: 1;
`;

const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  border-radius: 0 0 1rem 1rem;
  gap: 2rem;

  &:empty {
    display: none;
  }
`;

export const Modal = assignStyledNodes(
  styled(BaseModal)`
    display: flex;
    flex-direction: column;
    max-width: calc(100vw - 16rem);
    height: fit-content;
    margin: 8rem auto;
    border-radius: 1rem;
  `,
  {
    Title,
    Subtitle: SubHeading3,
    Header,
    Content,
    Footer,
  }
);
