import { useCallback, useEffect, useState } from 'react';
import { AnalyticsDataField } from '@src-v2/components/analytics-layer';
import {
  InventoryQueryObjectDescriptor,
  inventoryQueryObjectOptions,
} from '@src-v2/containers/inventory-query/inventory-query-object-options';
import { useInject, useLoading } from '@src-v2/hooks';
import { generateApiiroQl } from '@src-v2/models/apiiroql-query/apiiroql-generator';
import { ApiiroQlQueryAggregationDefinition } from '@src-v2/models/apiiroql-query/query-tree-aggregation-model';
import {
  CreateDefaultExpression,
  QExpression,
  QExpressionSchema,
} from '@src-v2/models/apiiroql-query/query-tree-model';
import {
  ApiiroQlSchema,
  createQExpressionSchemaForQueriedType,
} from '@src-v2/models/apiiroql-query/query-tree-schema-builder';
import { makeUrl } from '@src-v2/utils/history-utils';

export type InventoryQuerySettings = {
  description?: string;
  objectType: InventoryQueryObjectDescriptor;
  query: QExpression;
  aggregation?: ApiiroQlQueryAggregationDefinition;
};

export type ExportedQuerySettings = {
  $type: 'explorer-schema';
  $version: 1;
  rowset: string;
  query: QExpression;
  aggregation?: ApiiroQlQueryAggregationDefinition;
};

export function createExportedQuerySettings(
  querySettings: InventoryQuerySettings,
  compact: boolean = false
) {
  const exportedQuerySettings: ExportedQuerySettings = {
    $type: 'explorer-schema',
    $version: 1,
    rowset: querySettings.objectType.typeName,
    query: querySettings.query,
    aggregation: querySettings.aggregation,
  };

  return JSON.stringify(exportedQuerySettings, null, compact ? null : 2);
}

export function loadExportedQuerySettings(
  fullSchema: ApiiroQlSchema,
  importedFileContent: string
): InventoryQuerySettings {
  const importedJson = JSON.parse(importedFileContent);
  return loadExportedQuerySettingsJson(fullSchema, importedJson);
}

export function loadExportedQuerySettingsJson(
  apiiroQlSchema: ApiiroQlSchema,
  importedJson: any
): InventoryQuerySettings {
  const objectType = inventoryQueryObjectOptions.find(
    option => option.typeName === importedJson.rowset
  );

  if (importedJson.$type !== 'explorer-schema' || importedJson.$version > 1) {
    throw new Error('Invalid query definition file');
  }

  if (!objectType) {
    throw new Error('Invalid object type');
  }

  // Validate query by generating an expression
  const editingSchema = createQExpressionSchemaForQueriedType(apiiroQlSchema, objectType.typeName);
  generateApiiroQl(editingSchema[objectType.typeName], editingSchema, 's', importedJson.query);

  return { objectType, query: importedJson.query, aggregation: importedJson.aggregation };
}

export function generateQuerySettingsUrl(querySettings: InventoryQuerySettings): string {
  return makeUrl(new URL('/explorer', window.location.href), {
    q: createExportedQuerySettings(querySettings, true),
  });
}

export function createQuerySettingsAnalyticsData(querySettings: InventoryQuerySettings): any {
  return {
    [AnalyticsDataField.QueryType]: querySettings.objectType.typeName,
  };
}

export function useApiiroQlSchema(autoLoad = true): {
  loadQuerySchema: () => Promise<ApiiroQlSchema>;
  apiiroQlSchema: ApiiroQlSchema;
  querySchemaReady: boolean;
} {
  const { inventoryQuery } = useInject();
  const [apiiroQlSchema, setApiiroQlSchema] = useState<ApiiroQlSchema>();

  const [loadQuerySchema, querySchemaLoading] = useLoading(async () => {
    return await inventoryQuery.cachedGetApiiroQlSchemaForQuery();
  });

  useEffect(() => {
    if (autoLoad) {
      loadQuerySchema().then(setApiiroQlSchema);
    }
  }, [autoLoad]);

  return {
    loadQuerySchema,
    apiiroQlSchema,
    querySchemaReady: apiiroQlSchema && !querySchemaLoading,
  };
}

export function createNewQuerySettingsForObjectType(
  objectType: InventoryQueryObjectDescriptor,
  querySchema: QExpressionSchema
): InventoryQuerySettings {
  return {
    query: CreateDefaultExpression(querySchema, objectType.typeName),
    aggregation: null,
    objectType,
  };
}

export function useImportQuery(
  handleImportedQueryAsync: (querySettings: InventoryQuerySettings) => Promise<boolean>
) {
  const { toaster } = useInject();
  const { loadQuerySchema } = useApiiroQlSchema();

  return useCallback(
    async (importedFileContent: string) => {
      try {
        const querySchema = await loadQuerySchema();
        const querySettings = loadExportedQuerySettings(querySchema, importedFileContent);

        if (await handleImportedQueryAsync(querySettings)) {
          toaster.success('Query imported successfully');
        }
      } catch (e) {
        toaster.error(e.toString());
      }
    },
    [handleImportedQueryAsync, toaster]
  );
}

export function generateApiiroQlForQuerySettings(
  querySettings: InventoryQuerySettings,
  querySchema: QExpressionSchema
) {
  return generateApiiroQl(
    querySchema[querySettings.objectType?.typeName],
    querySchema,
    'subject',
    querySettings.query
  );
}
