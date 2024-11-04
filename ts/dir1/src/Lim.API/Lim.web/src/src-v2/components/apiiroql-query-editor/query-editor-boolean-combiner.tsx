import { Children, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import {
  PredicateAndOperatorButton,
  PredicateDeleteButton,
  PredicateOrOperatorButton,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-buttons';
import { SvgIcon } from '@src-v2/components/icons';
import {
  CreateDefaultExpression,
  QBooleanCombination,
  QExpression,
} from '@src-v2/models/apiiroql-query/query-tree-model';
import { QueryEditor, QueryEditorProps } from './query-editor';

export function BooleanCombinationEditor({
  query,
  setQuery,
  targetObjectTypeName,
  querySchema,
  readOnly,
}: QueryEditorProps<QBooleanCombination>) {
  const updateSubExpressions = useCallback(
    (updater: (input: QExpression[]) => QExpression[]) => {
      let updatedChildren = query.subExpressions.concat();
      updatedChildren = updater(updatedChildren);
      setQuery(Object.assign({}, query, { subExpressions: updatedChildren }));
    },
    [query, setQuery]
  );

  const updateSubExpression = useCallback(
    (index, query) => {
      updateSubExpressions(updatedChildren => {
        updatedChildren[index] = query;
        return updatedChildren;
      });
    },
    [updateSubExpressions]
  );

  const insertSubExpression = useCallback(
    (index, query) => {
      updateSubExpressions(updatedChildren => {
        updatedChildren.splice(index, 0, query);
        return updatedChildren;
      });
    },
    [updateSubExpressions]
  );

  const handleWrapWithCombiner = useCallback(
    (index, combiner) => {
      updateSubExpressions(updatedChildren => {
        const updatedChild = updatedChildren[index];

        if (combiner === 'not') {
          // @ts-expect-error
          if (updatedChild.type === 'boolean' && updatedChild.combiner === 'not') {
            [updatedChildren[index]] = updatedChild.subExpressions;
          } else {
            updatedChildren[index] = {
              type: 'boolean',
              combiner,
              subExpressions: [updatedChildren[index]],
            };
          }
        } else {
          updatedChildren[index] = {
            type: 'boolean',
            combiner,
            subExpressions: [
              updatedChildren[index],
              CreateDefaultExpression(querySchema, targetObjectTypeName),
            ],
          };
        }

        return updatedChildren;
      });
    },
    [query, targetObjectTypeName, querySchema, updateSubExpressions]
  );

  const handleDeleteSubexpression = useCallback(
    index => {
      const updatedChildren = query.subExpressions.concat();
      updatedChildren.splice(index, 1);

      if (updatedChildren.length === 1) {
        setQuery(updatedChildren[0]);
      } else {
        setQuery(Object.assign({}, query, { subExpressions: updatedChildren }));
      }
    },
    [query]
  );

  const handleBooleanOperatorClick = useCallback(
    (index, combiner) => {
      if (combiner === query.combiner) {
        insertSubExpression(index + 1, CreateDefaultExpression(querySchema, targetObjectTypeName));
      } else {
        handleWrapWithCombiner(index, combiner);
      }
    },
    [insertSubExpression, query, targetObjectTypeName, querySchema, handleWrapWithCombiner]
  );

  return (
    <BooleanCombinatorTree
      combinatorType={query.combiner}
      readOnly={readOnly}
      onAddRow={() =>
        insertSubExpression(
          query.subExpressions.length,
          CreateDefaultExpression(querySchema, targetObjectTypeName)
        )
      }>
      {query.subExpressions.map((expression, index) => (
        <BooleanCombinationRowPredicate key={index}>
          <QueryEditor
            querySchema={querySchema}
            targetObjectTypeName={targetObjectTypeName}
            query={expression}
            readOnly={readOnly}
            setQuery={query => updateSubExpression(index, query)}
            topRowExtensionControls={
              !readOnly && (
                <>
                  {query.subExpressions.length > 1 && (
                    <PredicateDeleteButton onClick={() => handleDeleteSubexpression(index)} />
                  )}

                  <PredicateAndOperatorButton
                    onClick={() => handleBooleanOperatorClick(index, 'and')}
                  />

                  <PredicateOrOperatorButton
                    onClick={() => handleBooleanOperatorClick(index, 'or')}
                  />
                </>
              )
            }
          />
        </BooleanCombinationRowPredicate>
      ))}
    </BooleanCombinatorTree>
  );
}

function BooleanCombinatorTree(props: {
  children: ReactNode;
  combinatorType: string;
  readOnly: boolean;
  onAddRow: () => void;
}) {
  const { children, combinatorType, onAddRow, readOnly } = props;

  return (
    <BooleanCombinationTreeContainer>
      {Children.map(children, (child, index) => (
        <BooleanCombinationRow key={index} data-bcrow="true">
          <BooleanCombinationTreeFragment
            operatorType={combinatorType}
            hasPrevious={index > 0}
            hasNext={index < Children.count(children) - 1}
            control={
              !readOnly && index === Children.count(children) - 1 ? (
                <BooleanAddRowButton data-operator-color-background="true" onClick={onAddRow}>
                  <SvgIcon name="PlusSmall" />
                </BooleanAddRowButton>
              ) : null
            }
          />
          {child}
        </BooleanCombinationRow>
      ))}

      <BooleanCombinationCombinerSelectorContainer data-operator={props.combinatorType}>
        <BooleanCombinationCombinerSelector>
          {props.combinatorType.toUpperCase()}
        </BooleanCombinationCombinerSelector>
      </BooleanCombinationCombinerSelectorContainer>
    </BooleanCombinationTreeContainer>
  );
}

const BooleanCombinationTreeFragmentPart = styled.div`
  margin-left: 7rem;
  width: 8rem;
`;

const BooleanCombinationTreeFragmentTopPart = styled(BooleanCombinationTreeFragmentPart)`
  height: 4rem;
  border-left: solid 1px;

  &[data-clear='true'] {
    border: 0;
  }
`;

const BooleanCombinationTreeFragmentBottomPart = styled(BooleanCombinationTreeFragmentPart)`
  border-left: solid 1px;
  flex-grow: 1;
`;

const BooleanCombinationTreeFragmentHorizontalPart = styled(BooleanCombinationTreeFragmentPart)`
  border-top: solid 1px;
`;

const BooleanCombinationTreeFragmentControlOverlay = styled.div`
  position: absolute;

  top: 0;
  left: 0;
  height: 8rem;
  width: 14rem;

  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  justify-items: center;
`;

const BooleanAddRowButton = styled.button`
  width: 5rem;
  height: 5rem;
  border-radius: 100vh;
  padding: 0;
  line-height: 0;
  color: white;

  svg {
    width: 5rem;
    height: 5rem;
  }
`;

const BooleanCombinationCombinerSelector = styled.div`
  display: inline;
  line-height: 4rem;
  font-size: 3rem;
  padding: 0.5rem 2rem;
  margin: 1rem 0;
  border-radius: 100vh;

  color: white;

  width: 14rem;
  text-align: center;
`;

const TreeFragmentStyledVerticalStack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;

  &[data-operator='and'] ${BooleanCombinationTreeFragmentPart} {
    border-color: var(--color-blue-60);
  }

  &[data-operator='or'] ${BooleanCombinationTreeFragmentPart} {
    border-color: var(--color-green-55);
  }

  &[data-operator='and'] {
    ${BooleanCombinationCombinerSelector}, ${BooleanAddRowButton} {
      background: var(--color-blue-60);

      &:hover {
        background: var(--color-blue-65);
      }
    }
  }

  &[data-operator='or'] {
    ${BooleanCombinationCombinerSelector}, ${BooleanAddRowButton} {
      background: var(--color-green-55);

      &:hover {
        background: var(--color-green-60);
      }
    }
  }

  &[data-operator='and'] {
    ${BooleanCombinationCombinerSelector}:hover, ${BooleanAddRowButton}:hover {
      background: var(--color-blue-65);
    }
  }

  &[data-operator='or'] {
    ${BooleanCombinationCombinerSelector}:hover, ${BooleanAddRowButton}:hover {
      background: var(--color-green-60);
    }
  }
`;

const BooleanCombinationCombinerSelectorContainer = styled(TreeFragmentStyledVerticalStack)`
  position: absolute;
  top: 0.5rem;
  left: 0;
  bottom: 0;
  width: 10rem;
  height: 10rem;

  align-content: flex-start;
  align-items: flex-start;
`;

function BooleanCombinationTreeFragment({ hasPrevious, hasNext, operatorType, control }) {
  return (
    <TreeFragmentStyledVerticalStack data-operator={operatorType}>
      <BooleanCombinationTreeFragmentTopPart
        data-clear={!hasPrevious}
        data-operator-color-border="true"
      />
      <BooleanCombinationTreeFragmentHorizontalPart data-operator-color-border="true" />
      {hasNext && <BooleanCombinationTreeFragmentBottomPart data-operator-color-border="true" />}
      {control && (
        <BooleanCombinationTreeFragmentControlOverlay>
          {control}
        </BooleanCombinationTreeFragmentControlOverlay>
      )}
    </TreeFragmentStyledVerticalStack>
  );
}

const BooleanCombinationRowPredicate = styled.div`
  display: flex;
  gap: 0.25rem 1rem;
  flex-grow: 1;
  flex-wrap: wrap;

  min-height: 26px;

  text-align: left;
  align-items: flex-start;
`;

const BooleanCombinationRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;

  min-width: 20rem;

  align-items: stretch;
`;

const BooleanCombinationTreeContainer = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
