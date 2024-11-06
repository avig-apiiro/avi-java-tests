import styled from 'styled-components';

export const HtmlSection = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  pre {
    overflow: auto;
    font-size: var(--font-size-xs);
    color: var(--color-blue-gray-70);
    font-weight: 400;
  }

  h2 {
    margin-top: 2rem;
    font-size: var(--font-size-s);
    font-weight: 600;
  }

  a {
    color: var(--color-blue-65);
    text-decoration: underline;

    &:hover {
      color: var(--color-blue-70);
    }
  }
`;
