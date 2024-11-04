import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { SubPredicateAddButton } from '@src-v2/components/apiiroql-query-editor/predicate-edit-buttons';
import {
  DetailsPane,
  PredicateCategorizedSelectWithDetailsPane,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-categorized-select-with-details-pane';
import {
  CreateDefaultExpression,
  QExpression,
  QExpressionObjectSchemaRelationship,
  QHasPredicate,
  QNegatedHasPredicate,
  getFullObjectSchema,
} from '@src-v2/models/apiiroql-query/query-tree-model';
import {
  PredicateEditorRow,
  PredicateEditorRowHeading,
  SubPredicateQueryContainer,
} from './predicate-edit-containers';
import { QueryEditorProps, QueryEditorWithBooleanWrappingSupport } from './query-editor';

export function QueryEditorRelationshipPredicate({
  query,
  setQuery,
  targetObjectTypeName,
  querySchema,
  readOnly,
}: QueryEditorProps<QHasPredicate | QNegatedHasPredicate>) {
  const expandedTargetObjectSchema = useMemo(
    () => getFullObjectSchema(querySchema[targetObjectTypeName], querySchema),
    [targetObjectTypeName, querySchema]
  );

  const updateRelationshipId = useCallback(
    relationshipId => {
      setQuery({ ...query, relationshipName: relationshipId, relationshipQuery: null });
    },
    [setQuery, query]
  );

  const categorizedRelationshipItems = useMemo(
    () => [
      {
        label: 'all',
        items: _.sortBy(expandedTargetObjectSchema.relationships, ['displayName']),
      },
    ],
    [expandedTargetObjectSchema]
  );

  return (
    <PredicateCategorizedSelectWithDetailsPane
      value={expandedTargetObjectSchema.relationships.find(
        relationship => relationship.id === query.relationshipName
      )}
      categorizedItems={categorizedRelationshipItems}
      itemToString={relationship => relationship.displayName}
      onItemSelected={relationship => updateRelationshipId(relationship.id)}
      itemToDescriptionPane={item => <RelationshipDetailsPane relationshipInfo={item} />}
      readOnly={readOnly}
      highlighted={true}
    />
  );
}

export function QueryEditorRelationshipPredicateExtension({
  query,
  setQuery,
  targetObjectTypeName,
  querySchema,
  readOnly,
}: QueryEditorProps<QHasPredicate | QNegatedHasPredicate>) {
  const expandedTargetObjectSchema = useMemo(
    () => getFullObjectSchema(querySchema[targetObjectTypeName], querySchema),
    [targetObjectTypeName, querySchema]
  );

  const updateChildQuery = useCallback(
    (newQuery: QExpression) => setQuery({ ...query, relationshipQuery: newQuery }),
    [setQuery, query]
  );

  const linkTargetRelationshipInfo = useMemo(() => {
    return expandedTargetObjectSchema.relationships.find(r => r.id === query.relationshipName);
  }, [expandedTargetObjectSchema, querySchema, query]);

  return (
    <>
      <SubPredicateQueryContainer>
        {query.relationshipQuery ? (
          <>
            <PredicateEditorRow>
              <PredicateEditorRowHeading>That</PredicateEditorRowHeading>
            </PredicateEditorRow>
            <QueryEditorWithBooleanWrappingSupport
              targetObjectTypeName={linkTargetRelationshipInfo?.targetType}
              querySchema={querySchema}
              query={query.relationshipQuery}
              setQuery={updateChildQuery}
              deletable={true}
              readOnly={readOnly}
            />
          </>
        ) : (
          !readOnly && (
            <SubPredicateAddButton
              onClick={() =>
                updateChildQuery(
                  CreateDefaultExpression(querySchema, linkTargetRelationshipInfo?.targetType)
                )
              }>
              That&nbsp;&nbsp;+
            </SubPredicateAddButton>
          )
        )}
      </SubPredicateQueryContainer>
    </>
  );
}

function RelationshipDetailsPane({
  relationshipInfo,
}: {
  relationshipInfo: QExpressionObjectSchemaRelationship;
}) {
  return (
    <DetailsPane title={relationshipInfo?.displayName}>{relationshipInfo?.description}</DetailsPane>
  );
}
