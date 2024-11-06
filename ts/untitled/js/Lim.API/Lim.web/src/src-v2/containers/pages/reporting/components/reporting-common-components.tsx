import styled from 'styled-components';

export const ReportsFrame = styled.iframe`
  width: 100%;
  height: calc(100vh - var(--top-bar-height) - 0.5rem);
`;

export const CenteredMessage = styled.div`
  width: 100%;
  height: calc(100vh - var(--top-bar-height));
  display: flex;
  align-items: center;
  justify-content: center;
`;
