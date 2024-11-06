import { ReactNode } from 'react';
import styled from 'styled-components';
import { FlexibleBoundary } from '@src-v2/components/layout/containers';

export function CardLayout({ children }: { children: ReactNode }) {
  return (
    <Container>
      <Card>{children}</Card>
    </Container>
  );
}

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  // Using non-standard colors for this container and therefore they're not in var
  background-color: #f9fafb;

  @media (max-width: 1580px) {
    padding: 20rem;
  }

  @media (min-width: 1924px) {
    padding: 25rem max(var(--max-resolution-spacing), 40rem);
  }

  &:after {
    content: '';
    position: absolute;
    bottom: -15vh;
    left: -150vw;
    width: 400vw;
    height: 42vh;
    transform: rotate(8deg);
    background: linear-gradient(180deg, #004ddc0d 0%, transparent 100%);
  }
`;

const Card = styled.div`
  width: 100rem;
  margin: 20rem auto;
  border-radius: 1rem;
  box-shadow: 0 0.5rem 5rem 0 var(--color-blue-gray-30);
  background-color: var(--color-white);
  z-index: 10;
  transition: height 400ms ease-in-out;

  @media (min-width: 1924px) {
    max-height: 235rem;
  }

  ${FlexibleBoundary} {
    min-height: 90rem;
  }
`;
