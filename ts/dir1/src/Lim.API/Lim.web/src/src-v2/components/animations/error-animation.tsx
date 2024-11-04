import styled, { css } from 'styled-components';
// @ts-ignore
import LogoHalf from '@src-v2/assets/apiiro-logo-half.svg';

export function ErrorAnimation() {
  return (
    <Container>
      <ApiiroSymbol />
      <ApiiroSymbol className={flipSymbol} />
    </Container>
  );
}

const Container = styled.div`
  display: inline-flex;
  color: var(--color-green-45);
`;

const ApiiroSymbol = styled(LogoHalf)`
  width: 16rem;
  height: 32rem;
  transform-origin: bottom right;
  animation: error-animation 1s linear;
  animation-fill-mode: forwards;
  animation-delay: 1s;

  @keyframes error-animation {
    to {
      transform: rotate(-45deg);
    }
  }
`;

const flipSymbol = css`
  position: relative;
  right: 16rem;
  transform: scaleX(-1);
  animation-name: error-flip-animation;
  animation-delay: 0.5s;

  @keyframes error-flip-animation {
    to {
      transform: scaleX(-1) rotate(-45deg);
    }
  }
`;
