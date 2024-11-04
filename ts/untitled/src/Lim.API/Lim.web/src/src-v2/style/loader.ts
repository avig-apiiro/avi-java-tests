import { createGlobalStyle } from 'styled-components';
import '@src-v2/style/index.css';
import { customScrollbar } from '@src-v2/style/mixins';

const GlobalStyle = createGlobalStyle`
    #modal {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      background-color: var(--overlay-dark-color);
      transition: opacity 400ms;
      z-index: 10;

      --scrollbar-color: var(--color-blue-gray-35);
      --scrollbar-border-color: var(--color-blue-gray-20);
      ${customScrollbar};

      &:empty {
        visibility: hidden;
        opacity: 0;
      }
    }

    iframe.beamer_beamer[allowfullscreen]{
          width: 540px;
    }
`;

export default GlobalStyle;
