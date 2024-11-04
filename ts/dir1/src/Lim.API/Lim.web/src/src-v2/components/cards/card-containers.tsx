import styled from 'styled-components';

export const CardTiles = styled.div`
  display: grid;
  grid-template-columns: repeat(
    var(--repeat-tiles-by, auto-fill),
    minmax(var(--card-tiles-min-width, 70rem), var(--card-tiles-max-width, 1fr))
  );
  gap: 4rem;
`;
