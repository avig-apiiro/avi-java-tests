import styled from 'styled-components';

export const TriangleUp = styled.span`
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 1.5rem 2rem 1.5rem;
  border-color: transparent transparent currentColor transparent;
`;

export const TriangleDown = styled.span`
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 2rem 1.5rem 0 1.5rem;
  border-color: currentColor transparent transparent transparent;
`;
