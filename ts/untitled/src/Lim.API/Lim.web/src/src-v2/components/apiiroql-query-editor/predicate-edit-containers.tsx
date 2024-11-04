import styled from 'styled-components';
import {
  PredicateDeleteButton,
  PredicateEditButton,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-buttons';

export const SubPredicateQueryContainer = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  flex-grow: 1;
  gap: 1rem;
  margin-top: 0rem;
`;

export const PredicateEditorRow = styled.div`
  min-height: 8rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  font-size: 3.5rem;
  margin-bottom: 3rem;

  ${PredicateEditButton}:not([data-persistent='true']) {
    display: none;
  }

  ${PredicateDeleteButton} {
    display: none;
  }

  &:not(:has([data-bcrow='true']:hover)):hover {
    ${PredicateEditButton}, ${PredicateDeleteButton} {
      display: block;
    }
  }
`;

export const PredicateEditorRowHeading = styled.div`
  margin-right: 2rem;
  font-size: 3.5rem;
`;
