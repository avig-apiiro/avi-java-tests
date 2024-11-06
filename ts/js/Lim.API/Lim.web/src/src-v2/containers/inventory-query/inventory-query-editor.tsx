import { Canceler } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { OptionalAggregationQueryEditor } from '@src-v2/components/apiiroql-query-editor/apiiroql-query-aggregation-editor';
import {
  DetailsPane,
  PredicateCategorizedSelectWithDetailsPane,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-categorized-select-with-details-pane';
import {
  PredicateEditorRow,
  PredicateEditorRowHeading,
  SubPredicateQueryContainer,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-containers';
import { QueryEditorWithBooleanWrappingSupport } from '@src-v2/components/apiiroql-query-editor/query-editor';
import {
  InventoryQueryObjectCategory,
  InventoryQueryObjectDescriptor,
  categorizedInventoryQueryObjectOptions,
} from '@src-v2/containers/inventory-query/inventory-query-object-options';
import {
  InventoryQuerySettings,
  createNewQuerySettingsForObjectType,
  generateApiiroQlForQuerySettings,
} from '@src-v2/containers/inventory-query/inventory-query-settings';
import { useInject } from '@src-v2/hooks';
import { QExpression, QExpressionSchema } from '@src-v2/models/apiiroql-query/query-tree-model';
import {
  ApiiroQlSchema,
  createQExpressionSchemaForQueriedType,
} from '@src-v2/models/apiiroql-query/query-tree-schema-builder';
import { ApiiroQlQueryAnalysisResponse, ApiiroQlQueryResultColumn } from '@src-v2/services';

type InventoryQueryEditorProps = {
  apiiroQlSchema: ApiiroQlSchema;
  querySettings: InventoryQuerySettings;
  onQuerySettingsChange: (newSettings: InventoryQuerySettings) => void;
  onLastCompletedQueryAnalysisChange?: (
    lastCompletedAnalysis: ApiiroQlQueryAnalysisResponse
  ) => void;
};
export function InventoryQueryEditor({
  onLastCompletedQueryAnalysisChange,
  onQuerySettingsChange,
  apiiroQlSchema,
  querySettings,
}: InventoryQueryEditorProps) {
  const { application } = useInject();

  const querySchema = useMemo(
    () => createQExpressionSchemaForQueriedType(apiiroQlSchema, querySettings.objectType.typeName),
    [apiiroQlSchema, querySettings]
  );

  const { queryTypeColumns, lastCompletedQueryAnalysis } = useQueryAnalysis(
    querySettings,
    querySchema
  );

  useEffect(() => {
    onLastCompletedQueryAnalysisChange?.(lastCompletedQueryAnalysis);
  }, [lastCompletedQueryAnalysis, onLastCompletedQueryAnalysisChange]);

  const activeCategorizedInventoryQueryOptions = useMemo(
    () =>
      categorizedInventoryQueryObjectOptions.map(optionsCategory => ({
        ...optionsCategory,
        items: optionsCategory.items.filter(
          item =>
            (!item.betaFeature || application.isFeatureEnabled(item.betaFeature)) &&
            (!item.queryBetaFeature || application.isFeatureEnabled(item.queryBetaFeature))
        ),
      })),
    [categorizedInventoryQueryObjectOptions]
  );

  const handleCategoryOptionSelected = useCallback(
    (item: InventoryQueryObjectDescriptor) => {
      if (querySettings.objectType !== item) {
        onQuerySettingsChange(createNewQuerySettingsForObjectType(item, querySchema));
      }
    },
    [querySettings, onQuerySettingsChange, querySchema]
  );

  const handleAggregationChanged = useCallback(
    newAggregationSettings => {
      onQuerySettingsChange({
        ...querySettings,
        aggregation: newAggregationSettings,
      });
    },
    [onQuerySettingsChange, querySettings]
  );

  const handleQueryDefinitionUpdate = useCallback(
    (query: QExpression) => onQuerySettingsChange({ ...querySettings, query }),
    [onQuerySettingsChange, querySettings]
  );

  return (
    <>
      <PrimaryQueryContainer>
        <PredicateEditorRow>
          <PredicateEditorRowHeading>Find</PredicateEditorRowHeading>
        </PredicateEditorRow>
        <PrimaryQueryHandledTypeAndQueryContainer>
          <PredicateEditorRow>
            <ObjectTypeDescriptorSelector
              onItemSelected={handleCategoryOptionSelected}
              categorizedItems={activeCategorizedInventoryQueryOptions}
              value={querySettings.objectType}
            />
          </PredicateEditorRow>
          <SubPredicateQueryContainer>
            <PredicateEditorRow>
              <PredicateEditorRowHeading>That</PredicateEditorRowHeading>
            </PredicateEditorRow>
            <QueryEditorWithBooleanWrappingSupport
              querySchema={querySchema}
              targetObjectTypeName={querySettings.objectType.typeName}
              query={querySettings.query}
              setQuery={handleQueryDefinitionUpdate}
              readOnly={false}
            />
          </SubPredicateQueryContainer>
        </PrimaryQueryHandledTypeAndQueryContainer>
      </PrimaryQueryContainer>

      {queryTypeColumns && (
        <OptionalAggregationQueryEditor
          aggregation={querySettings.aggregation}
          onAggregationChanged={handleAggregationChanged}
          availableColumns={queryTypeColumns}
        />
      )}
    </>
  );
}

export function ObjectTypeDescriptorSelector({
  onItemSelected,
  categorizedItems,
  value,
  readOnly = false,
}: {
  onItemSelected: (selectedItem: InventoryQueryObjectDescriptor) => void;
  categorizedItems: InventoryQueryObjectCategory[];
  value: InventoryQueryObjectDescriptor;
  readOnly?: boolean;
}) {
  return (
    <PredicateCategorizedSelectWithDetailsPane
      onItemSelected={onItemSelected}
      categorizedItems={categorizedItems}
      value={value}
      readOnly={readOnly}
      itemToString={item => item.displayName}
      itemToIcon={item => item.icon}
      itemToDescriptionPane={item => (
        <SupportedQueryObjectDescription supportedQueryObject={item} />
      )}
      highlighted={true}
      minHeight="75rem"
    />
  );
}

function SupportedQueryObjectDescription({ supportedQueryObject }) {
  return (
    <DetailsPane title={supportedQueryObject?.displayName} titleIcon={supportedQueryObject?.icon}>
      {supportedQueryObject && <p>{supportedQueryObject?.description}</p>}
    </DetailsPane>
  );
}

function useQueryAnalysis(querySettings: InventoryQuerySettings, querySchema: QExpressionSchema) {
  const { apiClient, inventoryQuery } = useInject();
  const [queryTypeColumns, setQueryTypeColumns] = useState<ApiiroQlQueryResultColumn[]>();
  const [queryAnalysis, setQueryAnalysis] = useState<ApiiroQlQueryAnalysisResponse>();
  const [lastCompletedQueryAnalysis, setLastCompletedQueryAnalysis] =
    useState<ApiiroQlQueryAnalysisResponse>();
  const [queryAnalysisLoading, setQueryAnalysisLoading] = useState(false);
  const pendingRequestCancellationToken = useRef<Canceler>();

  useEffect(() => {
    setQueryTypeColumns(null);
  }, [setQueryTypeColumns, querySettings.objectType]);

  useEffect(() => {
    setQueryAnalysis(null);
    pendingRequestCancellationToken.current?.('Reloading analysis');

    if (querySchema && querySettings.query) {
      setQueryAnalysisLoading(true);

      const { token, cancel } = apiClient.createCancelToken();
      pendingRequestCancellationToken.current = cancel;

      const analysisPromise = inventoryQuery.analyzeInventoryQuery(
        {
          queriedType: querySettings.objectType.typeName,
          query: generateApiiroQlForQuerySettings(querySettings, querySchema),
          projectionFields: [],
        },
        { cancelToken: token }
      );

      analysisPromise.then(
        analysisResult => {
          setQueryAnalysisLoading(false);
          setLastCompletedQueryAnalysis(analysisResult);
          setQueryTypeColumns(analysisResult.queryResultColumns);
          setQueryAnalysis(analysisResult);
        },
        () => {
          setQueryAnalysisLoading(false);
        }
      );
    }
  }, [
    querySettings,
    apiClient,
    setQueryAnalysis,
    pendingRequestCancellationToken,
    inventoryQuery,
    querySchema,
    setQueryTypeColumns,
  ]);

  return {
    queryTypeColumns,
    queryAnalysis,
    queryAnalysisLoading,
    lastCompletedQueryAnalysis,
  };
}

const PrimaryQueryContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

const PrimaryQueryHandledTypeAndQueryContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
