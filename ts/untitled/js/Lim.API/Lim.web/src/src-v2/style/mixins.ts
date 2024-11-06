export const customScrollbar = `
  transform: translateZ(0);
  overflow: auto;  /* fallback */
  overflow: overlay;
  
  &[data-scrollbar-gutters] {
    scrollbar-gutter: stable both-edges;
  }
  
  &:hover {
    &::-webkit-scrollbar-thumb {
        visibility: visible;
    }
  }

  &::-webkit-scrollbar {
    width: var(--scrollbar-width);
    height: 3rem;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    visibility: hidden;
    background-clip: padding-box;
    background-color: var(--scrollbar-color);
    box-shadow: inset 0 0 0 0.25rem var(--scrollbar-border-color);
    border: 0.75rem solid transparent;
    border-radius: 100vmax;
    
    &:hover {
      border: 0.5rem solid transparent;
    }
  }
  
  &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
`;
