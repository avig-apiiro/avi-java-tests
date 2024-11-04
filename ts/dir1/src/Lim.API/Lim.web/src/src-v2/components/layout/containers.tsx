import styled from 'styled-components';

export const Gutters = styled.div`
  padding-left: max(var(--max-resolution-spacing), 7rem); // scrollbar-gutters adds additional 3rem
  padding-right: max(var(--max-resolution-spacing), 7rem); // scrollbar-gutters adds additional 3rem

  &[data-top-spacing] {
    padding-top: 7rem;
  }

  &[data-bottom-spacing] {
    padding-bottom: 7rem;
  }
`;

export const Section = styled.section`
  padding: 10rem max(var(--max-resolution-spacing), 7rem);

  &:empty {
    display: none;
  }
`;

export const InwardSection = styled.section`
  margin: 10rem max(var(--max-resolution-spacing), 7rem);

  &:empty {
    display: none;
  }
`;

export const FlexibleBoundary = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
`;
