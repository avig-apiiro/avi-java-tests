import { useCallback, useMemo } from 'react';
import { SubPredicateAddButton } from '@src-v2/components/apiiroql-query-editor/predicate-edit-buttons';
import {
  PredicateEditorRow,
  PredicateEditorRowHeading,
  SubPredicateQueryContainer,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-containers';
import { PredicateArgumentSelect } from '@src-v2/components/apiiroql-query-editor/predicate-edit-inputs';
import {
  QueryEditorProps,
  QueryEditorWithBooleanWrappingSupport,
} from '@src-v2/components/apiiroql-query-editor/query-editor';
import {
  CreateDefaultExpression,
  QExpression,
  QTypeSwitchPredicate,
  getObjectSubtypeOptions,
} from '@src-v2/models/apiiroql-query/query-tree-model';

export function TypeSwitchPredicateEditor({
  query,
  targetObjectTypeName,
  querySchema,
  setQuery,
  readOnly,
}: QueryEditorProps<QTypeSwitchPredicate>) {
  const viableSubtypes = useMemo(() => {
    const subtypes = getObjectSubtypeOptions(targetObjectTypeName, querySchema);
    subtypes.sort();
    return subtypes;
  }, [targetObjectTypeName, querySchema]);

  const updateTypeSelector = useCallback(
    typeSelector => {
      setQuery({ type: 'typeSwitch', typeQueries: [{ typeSelector, query: null }] });
    },
    [setQuery]
  );

  return (
    <PredicateArgumentSelect
      items={viableSubtypes}
      value={query.typeQueries[0].typeSelector}
      readOnly={readOnly}
      onItemSelected={updateTypeSelector}
    />
  );
}

export function TypeSwitchPredicateEditorExtension({
  querySchema,
  setQuery,
  query,
  readOnly,
}: QueryEditorProps<QTypeSwitchPredicate>) {
  const updateChildQuery = useCallback(
    (newQuery: QExpression) => {
      setQuery({ ...query, typeQueries: [{ ...query.typeQueries[0], query: newQuery }] });
    },
    [setQuery, query]
  );

  const editedTypeQuery = query.typeQueries?.[0];
  const typeSwitchTargetTypeName = editedTypeQuery?.typeSelector;

  return (
    <>
      <SubPredicateQueryContainer>
        {editedTypeQuery?.query ? (
          <>
            <PredicateEditorRow>
              <PredicateEditorRowHeading>That</PredicateEditorRowHeading>
            </PredicateEditorRow>
            <QueryEditorWithBooleanWrappingSupport
              targetObjectTypeName={typeSwitchTargetTypeName}
              querySchema={querySchema}
              query={editedTypeQuery?.query}
              setQuery={updateChildQuery}
              deletable={true}
              readOnly={readOnly}
            />
          </>
        ) : (
          !readOnly && (
            <SubPredicateAddButton
              onClick={() =>
                updateChildQuery(CreateDefaultExpression(querySchema, typeSwitchTargetTypeName))
              }>
              That&nbsp;&nbsp;+
            </SubPredicateAddButton>
          )
        )}
      </SubPredicateQueryContainer>
    </>
  );
}
