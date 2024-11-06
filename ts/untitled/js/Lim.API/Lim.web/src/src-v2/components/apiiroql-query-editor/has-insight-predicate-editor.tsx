import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { PredicateExtensibleEnumSelect } from '@src-v2/components/apiiroql-query-editor/predicate-edit-inputs';
import {
  QInsightBadgePredicate,
  QNegatedInsightBadgePredicate,
  getFullObjectSchema,
} from '@src-v2/models/apiiroql-query/query-tree-model';
import { QueryEditorProps } from './query-editor';

export function HasInsightPredicateEditor({
  query,
  setQuery,
  targetObjectTypeName,
  querySchema,
  readOnly,
}: QueryEditorProps<QInsightBadgePredicate | QNegatedInsightBadgePredicate>) {
  const expandedTargetObjectSchema = useMemo(
    () => getFullObjectSchema(querySchema[targetObjectTypeName], querySchema),
    [targetObjectTypeName, querySchema]
  );

  const insightType = expandedTargetObjectSchema.relationships.find(
    property => property.id === 'insights'
  ).targetType;

  const insightBadgeSchema = querySchema[insightType].properties.find(
    propertyInfo => propertyInfo.id === 'badge'
  );

  const updateInsight = useCallback(
    insightBadge => {
      setQuery({ ...query, insightBadge });
    },
    [setQuery, query]
  );

  const sortedInsightValues = useMemo(
    () => _.sortBy(insightBadgeSchema.enumValues),
    [insightBadgeSchema.enumValues]
  );

  return (
    <PredicateExtensibleEnumSelect
      enumItems={sortedInsightValues}
      allowCustom={insightBadgeSchema.openEnum}
      value={query.insightBadge}
      onChange={value => updateInsight(value)}
      readOnly={readOnly}
      highlighted={true}
    />
  );
}
