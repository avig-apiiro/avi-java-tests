import { useCallback } from 'react';
import {
  PredicateArgumentInput,
  PredicateArgumentSelect,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-inputs';
import { apiiroQlOperatorSupportRegistry } from '@src-v2/models/apiiroql-query/apiiroql-generator';
import { QNamePredicate } from '@src-v2/models/apiiroql-query/query-tree-model';
import { QueryEditorProps } from './query-editor';

export function NamePredicateEditor({
  query,
  setQuery,
  readOnly,
}: QueryEditorProps<QNamePredicate>) {
  const updateOperator = useCallback(
    operator => {
      setQuery(Object.assign({}, query, { operator }));
    },
    [setQuery, query]
  );

  const updateOperand = useCallback(
    operand => {
      setQuery(Object.assign({}, query, { operand }));
    },
    [setQuery, query]
  );

  const operators = apiiroQlOperatorSupportRegistry.aqlString;
  const selectedOperator = operators.find(
    operatorSupport => operatorSupport.operator === query.operator
  );

  return (
    <>
      <PredicateArgumentSelect
        value={selectedOperator}
        itemToString={operatorSupport => operatorSupport.displayName}
        onItemSelected={operatorSupport => updateOperator(operatorSupport.operator)}
        items={operators}
        readOnly={readOnly}
      />
      <PredicateArgumentInput
        value={query.operand}
        onChange={event => updateOperand(event.target.value)}
        data-highlighted="true"
        readOnly={readOnly}
      />
    </>
  );
}
