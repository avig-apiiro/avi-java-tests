import styled from 'styled-components';
// @ts-ignore
import ApiiroLogoSmall from '@src-v2/assets/apiiro-logo-small.svg';

export const LogoSpinner = styled(ApiiroLogoSmall)`
  color: var(--color-green-45);
  animation: rotate-3d 3s infinite;

  @keyframes rotate-3d {
    25% {
      transform: rotateX(180deg);
    }
    50% {
      transform: rotateY(180deg);
    }
    75% {
      transform: rotateZ(180deg);
    }
  }
`;
