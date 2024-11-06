import styled from 'styled-components';
import Bold from '@src/components/Bold';
import {
  StyledDescription,
  StyledFilterButtons,
  StyledInsightsTitle,
} from '@src/components/CodeAggregation/Insights/InsightStyles';
import { StyledNumber } from '@src/components/FilterButtons';
import { StyledSortedList } from '@src/components/Panes/Common';
import {
  RowMenu,
  StyledCell,
  StyledCellContents,
  StyledHeader,
  StyledRow,
  StyledTable,
} from '@src/components/Table';
import { StyledItem } from '@src/components/TitledList';
import { VerticalStack } from '@src/components/VerticalStack';

export const LegacyPaneStylingContainer = styled.div`
  ${Bold} {
    font-size: var(--font-size-s);
  }

  a {
    color: var(--color-blue-65);

    &:hover {
      opacity: 1;
      text-decoration: underline;
      color: var(--color-blue-70);
    }
  }

  ${VerticalStack} {
    gap: 0;
  }

  ${StyledInsightsTitle} {
    margin-top: 0;
    font-size: var(--font-size-s);
    font-weight: 300;
    text-decoration: underline;
    white-space: nowrap;
    line-height: 1.5;
  }

  ${StyledDescription} {
    font-size: var(--font-size-s);
    line-height: 1.5;
  }

  ${StyledSortedList} {
    line-height: 1.5;
  }

  ${StyledFilterButtons} {
    padding: 0;

    button {
      opacity: 1 !important;
      font-size: var(--font-size-s);
      border: 0.25rem solid var(--color-blue-gray-30) !important;

      &:hover {
        border-color: var(--color-blue-gray-50) !important;
        background-color: var(--color-blue-20);
      }

      &[data-active] {
        border-color: var(--color-blue-65) !important;
        background-color: var(--color-blue-25);

        &:hover {
          background-color: var(--color-blue-35);
        }
      }

      ${StyledNumber} {
        font-size: var(--font-size-s);
      }
    }
  }

  ${StyledTable} {
    margin-top: 4rem;
    border: 0.25rem solid var(--color-blue-gray-30);
    border-radius: 3rem;
    overflow: hidden;

    ${StyledHeader} {
      position: relative;
      color: var(--color-blue-gray-60);
      background-color: var(--color-blue-gray-20);
      font-size: var(--font-size-s);
      font-weight: 400;

      &:not(:first-child):before {
        content: '';
        position: absolute;
        inset: 2rem auto 2rem 0;
        border-left: 0.25rem solid var(--color-blue-gray-30);
      }
    }

    ${StyledRow} {
      padding: 0;

      ${StyledCell} {
        min-height: 13rem;
        border-color: var(--color-blue-gray-20);

        ${StyledCellContents} > a {
          color: var(--color-blue-65);
          overflow: hidden;
          text-overflow: ellipsis;

          &:hover {
            color: var(--color-blue-70);
          }
        }
      }

      &:last-child ${StyledCell} {
        border: none;
      }

      ${RowMenu} svg[data-name="Code"] {
        width: 6rem;
        height: 6rem;
        color: var(--color-blue-gray-50);
        border: 0.25rem solid var(--color-blue-gray-50);
        border-radius: 100vmax;
        background: transparent;
        transition:
          color,
          background-color,
          border 240ms;

        &:hover {
          color: var(--color-blue-gray-60);
          background: var(--color-blue-gray-20);
          border: 0.25rem solid var(--color-blue-gray-60);
        }
      }
    }

    ${StyledItem} {
      font-size: var(--font-size-s);
      font-weight: 400;
      line-height: 1.5;
    }
  }
`;
