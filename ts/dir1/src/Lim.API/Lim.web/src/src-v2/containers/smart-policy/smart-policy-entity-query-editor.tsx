import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import {
  PredicateEditorRow,
  PredicateEditorRowHeading,
  SubPredicateQueryContainer,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-containers';
import { QueryEditorWithBooleanWrappingSupport } from '@src-v2/components/apiiroql-query-editor/query-editor';
import { ObjectTypeDescriptorSelector } from '@src-v2/containers/inventory-query/inventory-query-editor';
import {
  InventoryQueryObjectDescriptor,
  categorizedInventoryQueryObjectOptions,
  createGovernanceRuleTargetFromTargetObjectType,
} from '@src-v2/containers/inventory-query/inventory-query-object-options';
import { useInject, useSuspense } from '@src-v2/hooks';
import { generateApiiroQl } from '@src-v2/models/apiiroql-query/apiiroql-generator';
import {
  CreateDefaultExpression,
  QExpression,
} from '@src-v2/models/apiiroql-query/query-tree-model';

export type VerbatimEditableApiiroQlExpression = {
  type: 'verbatim';
  apiiroQlSource: string;
};

export type QueryTreeEditableApiiroQlExpression = {
  type: 'queryTree';
  queryTree: QExpression;
  apiiroQlSource: string;
};

export type EditableApiiroQlExpressionTokenizedString = {
  type: 'tokenString';
  components: (string | { apiiroQl: string })[];
  apiiroQlSource: string;
};

export type EditableApiiroQlExpression =
  | VerbatimEditableApiiroQlExpression
  | QueryTreeEditableApiiroQlExpression
  | EditableApiiroQlExpressionTokenizedString;

export function SmartPolicyEntityQueryEditorFormControl({
  targetObjectTypeFieldName,
  entityPredicateFieldName,
}: {
  targetObjectTypeFieldName: string;
  entityPredicateFieldName: string;
}) {
  const formContext = useFormContext();
  const targetObjectType = formContext.watch(targetObjectTypeFieldName);
  const entityPredicate = formContext.watch(entityPredicateFieldName);

  return (
    <SmartPolicyEntityQueryEditor
      targetObjectType={targetObjectType}
      setTargetObjectType={value =>
        formContext.setValue(targetObjectTypeFieldName, value, {
          shouldDirty: true,
          shouldTouch: true,
        })
      }
      entityPredicate={entityPredicate}
      setEntityPredicate={value =>
        formContext.setValue(entityPredicateFieldName, value, {
          shouldDirty: true,
          shouldTouch: true,
        })
      }
    />
  );
}

export function SmartPolicyEntityQueryEditor({
  targetObjectType,
  setTargetObjectType,
  entityPredicate,
  setEntityPredicate,
}: {
  targetObjectType: InventoryQueryObjectDescriptor;
  setTargetObjectType?: (selectedType: InventoryQueryObjectDescriptor) => void;
  entityPredicate: EditableApiiroQlExpression;
  setEntityPredicate?: (entityPredicate: EditableApiiroQlExpression) => void;
}) {
  const { governance, application, inventoryQuery } = useInject();

  const isReadOnly = !(setTargetObjectType && setEntityPredicate);

  const [querySchema, governanceRuleOptions] = useSuspense([
    [
      inventoryQuery.cachedGetQExpressionSchema,
      { schemaVariant: 'ApiiroQlRiskDiffableCondition', queriedType: null },
    ],
    [governance.getRuleOptions],
  ]) as any;

  const smartPolicyTargetObjectOptions = useMemo(() => {
    return categorizedInventoryQueryObjectOptions.map(optionsCategory => ({
      ...optionsCategory,
      items: optionsCategory.items.filter(
        item =>
          (!item.betaFeature || application.isFeatureEnabled(item.betaFeature)) &&
          createGovernanceRuleTargetFromTargetObjectType(item, governanceRuleOptions)
      ),
    }));
  }, [categorizedInventoryQueryObjectOptions, governanceRuleOptions]);

  const setPredicateExpression = useCallback(
    (newPredicateExpression: QExpression, targetObjectType: InventoryQueryObjectDescriptor) => {
      setEntityPredicate({
        type: 'queryTree',
        queryTree: newPredicateExpression,
        apiiroQlSource: generateApiiroQl(
          querySchema[targetObjectType.typeName],
          querySchema,
          'subject',
          newPredicateExpression
        ),
      });
    },
    [querySchema, setEntityPredicate]
  );

  const setupDefaultPredicateForTargetType = useCallback(
    (targetObject: InventoryQueryObjectDescriptor) => {
      const newPredicateExpression = CreateDefaultExpression(querySchema, targetObject.typeName);
      setPredicateExpression(newPredicateExpression, targetObject);
    },
    [setPredicateExpression]
  );

  useEffect(() => {
    if (targetObjectType && !entityPredicate) {
      setupDefaultPredicateForTargetType(targetObjectType);
    }
  });

  const handleTargetObjectSelected = useCallback(
    (targetObject: InventoryQueryObjectDescriptor) => {
      setTargetObjectType(targetObject);
      setupDefaultPredicateForTargetType(targetObject);
    },
    [querySchema, setTargetObjectType, setEntityPredicate]
  );

  const handleGraphicalQueryDefinitionChange = useCallback(
    (query: QExpression) => setPredicateExpression(query, targetObjectType),
    [setPredicateExpression, targetObjectType]
  );

  return (
    <EntityQueryEditorContainer>
      <PredicateEditorRow>
        <ObjectTypeDescriptorSelector
          onItemSelected={handleTargetObjectSelected}
          categorizedItems={smartPolicyTargetObjectOptions}
          value={targetObjectType}
          readOnly={isReadOnly}
        />
      </PredicateEditorRow>
      {targetObjectType && entityPredicate && (
        <SubPredicateQueryContainer>
          <PredicateEditorRow>
            <PredicateEditorRowHeading>That</PredicateEditorRowHeading>
          </PredicateEditorRow>
          <QueryEditorWithBooleanWrappingSupport
            querySchema={querySchema}
            targetObjectTypeName={targetObjectType.typeName}
            query={entityPredicate.type === 'queryTree' && entityPredicate.queryTree}
            setQuery={handleGraphicalQueryDefinitionChange}
            readOnly={isReadOnly}
          />
        </SubPredicateQueryContainer>
      )}
    </EntityQueryEditorContainer>
  );
}

const EntityQueryEditorContainer = styled.div`
  padding: 3rem;
  border: solid 1px var(--color-blue-gray-30);
  border-radius: 3rem;
  width: 100%;

  overflow-x: auto;
`;
