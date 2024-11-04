import { RefObject, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';

export function ScrollToTop({
  container = 'main',
}: {
  container?: string | RefObject<HTMLElement>;
}) {
  const [visibility, setVisibility] = useState(false);

  const containerElement =
    typeof container === 'string' ? document.getElementById(container) : container.current;

  useLayoutEffect(() => {
    const handleScroll = ({ target }) => setVisibility(target.offsetHeight / 2 < target.scrollTop);
    containerElement?.addEventListener('scroll', handleScroll);
    return () => containerElement?.removeEventListener('scroll', handleScroll);
  }, [containerElement]);

  return (
    <Container
      style={{ visibility: visibility ? 'visible' : 'hidden', opacity: visibility ? 1 : 0 }}
      onClick={() => containerElement?.scrollTo({ top: 0, behavior: 'smooth' })}>
      <SvgIcon name="Chevron" />
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  right: 15rem;
  bottom: 15rem;
  display: flex;
  width: 10rem;
  height: 10rem;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  border-radius: 10vmax;
  background-color: var(--color-blue-gray-70);
  box-shadow: var(--elevation-1);
  transition: all 200ms;
  z-index: 9;
  cursor: pointer;

  &:hover {
    background-color: var(--color-blue-gray-65);
    box-shadow: var(--elevation-2);
  }

  ${BaseIcon} {
    transform: rotate(-90deg);
  }
`;
