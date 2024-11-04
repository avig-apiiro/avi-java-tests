import _ from 'lodash';
import { getPathById } from '@src-v2/components/sortable-tree/tree-methods';
import {
  InventoryQueryObjectDescriptor,
  inventoryQueryObjectOptions,
} from '@src-v2/containers/inventory-query/inventory-query-object-options';
import {
  ExportedQuerySettings,
  InventoryQuerySettings,
  createExportedQuerySettings,
} from '@src-v2/containers/inventory-query/inventory-query-settings';
import ioc from '@src-v2/ioc';
import { ApiiroQlQueryAggregationDefinition } from '@src-v2/models/apiiroql-query/query-tree-aggregation-model';
import { QExpressionSchema } from '@src-v2/models/apiiroql-query/query-tree-model';
import {
  ApiiroQlSchema,
  createQExpressionSchemaForVariant,
} from '@src-v2/models/apiiroql-query/query-tree-schema-builder';
import { ApiClient } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { AsyncCache } from '@src-v2/services/async-cache';
import { ApiiroQlQueryResultRow } from '@src-v2/types/apiiro-query-languange/apiiro-ql-query-result-row';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { Insight } from '@src-v2/types/risks/insight';
import { StubAny } from '@src-v2/types/stub-any';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export type ApiiroQlQueryResultColumnType =
  | 'ApiiroQlQueryResultFieldString'
  | 'ApiiroQlQueryResultFieldBoolean'
  | 'ApiiroQlQueryResultFieldNumber'
  | 'ApiiroQlQueryResultFieldInsights'
  | 'ApiiroQlQueryResultFieldRiskTriggerInsights'
  | 'ApiiroQlQueryResultFieldConsumableProfile'
  | 'ApiiroQlQueryResultFieldMultiSourcedEntity'
  | 'ApiiroQlQueryResultFieldDataModelObject'
  | 'ApiiroQlQueryResultFieldStringList'
  | 'ApiiroQlQueryResultFieldCodeReference';

export type ApiiroQlQueryResultColumn = {
  key: string;
  title: string;
  type: ApiiroQlQueryResultColumnType;
};

export type ApiiroQlQueryResponse = {
  rows: ApiiroQlQueryResultRow[];
  columns: ApiiroQlQueryResultColumn[];
  rowLimitReached: boolean;
  diagnostics?: any;
};

export type ApiiroQlQueryAnalysisResponse = {
  queryResultColumns: ApiiroQlQueryResultColumn[];
};

/* eslint-disable no-use-before-define */
export type FavoritesFolder<TPayload> = {
  name: string;
  folderContent: FavoritesItem<TPayload>[];
};
/* eslint-enable no-use-before-define */

export type FavoritesLeafItem<TPayload> = {
  name: string;
  itemContent: TPayload;
  new: boolean;
};

export type FavoritesItem<TPayload> = FavoritesLeafItem<TPayload> | FavoritesFolder<TPayload>;
export const apiiroQlResultColumnTypeDataHandlers: {
  [fieldType in ApiiroQlQueryResultColumnType]: {
    toString: (fieldValue: any) => string;
    matchesSearch: (fieldValue: any, lowerCaseSearchTerm: string) => boolean;
    sortComparator?: (leftFieldValue: StubAny, rightFieldValue: StubAny) => number;
  };
} = {
  ApiiroQlQueryResultFieldString: {
    toString: field => field.value,
    matchesSearch: (field, lowerCaseSearchTerm) =>
      field.value.toLowerCase().includes(lowerCaseSearchTerm),
    sortComparator: (leftFieldValue, rightFieldValue) =>
      leftFieldValue.value.localeCompare(rightFieldValue.value),
  },
  ApiiroQlQueryResultFieldStringList: {
    toString: field => field.values.join(', '),
    matchesSearch: (field, lowerCaseSearchTerm) =>
      field.values.find((value: string) => value.toLowerCase().includes(lowerCaseSearchTerm)),
    sortComparator: (leftFieldValue, rightFieldValue) =>
      _.zip(leftFieldValue.values, rightFieldValue.values)
        .map(([left, right]: [string, string]) => (left ?? '').localeCompare(right))
        .find(comparison => comparison !== 0) ?? leftFieldValue.count - rightFieldValue.count,
  },
  ApiiroQlQueryResultFieldNumber: {
    toString: field => String(field.value),
    matchesSearch: () => false,
    sortComparator: (leftFieldValue, rightFieldValue) =>
      leftFieldValue.value - rightFieldValue.value,
  },
  ApiiroQlQueryResultFieldBoolean: {
    toString: field => (field.value ? 'True' : 'False'),
    matchesSearch: (field, lowerCaseSearchTerm) =>
      field.value.toString().includes(lowerCaseSearchTerm),
    sortComparator: (leftFieldValue, rightFieldValue) =>
      leftFieldValue.value === rightFieldValue.value ? 0 : leftFieldValue.value ? 1 : -1,
  },
  ApiiroQlQueryResultFieldInsights: {
    toString: field => field.insights.map((insight: Insight) => insight.badge).join(', '),
    matchesSearch: (field, lowerCaseSearchTerm) =>
      Boolean(
        field.insights.find((insight: Insight) =>
          insight.badge.toLowerCase().includes(lowerCaseSearchTerm)
        )
      ),
  },
  ApiiroQlQueryResultFieldDataModelObject: {
    toString: field => field.description,
    matchesSearch: (field, lowerCaseSearchTerm) =>
      Boolean(field.description.toLowerCase().includes(lowerCaseSearchTerm)),
  },
  ApiiroQlQueryResultFieldRiskTriggerInsights: {
    toString: field => field.insights.map((insight: Insight) => insight.badge).join(', '),
    matchesSearch: (field, lowerCaseSearchTerm) =>
      Boolean(
        field.insights.find((insight: Insight) =>
          insight.badge.toLowerCase().includes(lowerCaseSearchTerm)
        )
      ),
  },
  ApiiroQlQueryResultFieldConsumableProfile: {
    toString: field =>
      field.leanConsumableProfile
        ? [
            field.leanConsumableProfile.name,
            field.leanConsumableProfile.referenceName,
            field.leanConsumableProfile.url,
          ].join(', ')
        : '',
    matchesSearch: (field, lowerCaseSearchTerm) =>
      Boolean(
        [
          field.leanConsumableProfile.name,
          field.leanConsumableProfile.referenceName,
          field.leanConsumableProfile.url,
        ].find(soughtValue => soughtValue.toLowerCase().includes(lowerCaseSearchTerm))
      ),
    sortComparator: (leftFieldValue, rightFieldValue) =>
      leftFieldValue.leanConsumableProfile.name.localeCompare(
        rightFieldValue.leanConsumableProfile.name
      ),
  },
  ApiiroQlQueryResultFieldMultiSourcedEntity: {
    toString: field => {
      return field.leanConsumableProfile
        ? [
            field.leanConsumableProfile.name,
            field.leanConsumableProfile.referenceName,
            field.leanConsumableProfile.url,
          ].join(', ')
        : '';
    },
    matchesSearch: (field, lowerCaseSearchTerm) =>
      Boolean(
        [
          field.leanConsumableProfile.name,
          field.leanConsumableProfile.referenceName,
          field.leanConsumableProfile.url,
        ].find(soughtValue => soughtValue.toLowerCase().includes(lowerCaseSearchTerm))
      ),
    sortComparator: (leftFieldValue, rightFieldValue) =>
      leftFieldValue.leanConsumableProfile.name.localeCompare(
        rightFieldValue.leanConsumableProfile.name
      ),
  },
  ApiiroQlQueryResultFieldCodeReference: {
    matchesSearch: (field: CodeReference, lowerCaseSearchTerm) =>
      Boolean(field.relativeFilePath?.toLowerCase().includes(lowerCaseSearchTerm)),
    toString: field => {
      return field ? field.relativeFilePath ?? '' : '';
    },
  },
};

export const inventoryQueryGlobalResultsLimit = 10000;

const mappedInventoryQueryObjectOptions = inventoryQueryObjectOptions.reduce(
  (acc, item) => {
    acc[item.typeName] = item;
    return acc;
  },
  {} as Record<string, InventoryQueryObjectDescriptor>
);

export type ApiiroQlQueryDefinition = {
  queriedType: string;
  query: string;
  projectionFields: any[];
  aggregationDefinition?: ApiiroQlQueryAggregationDefinition;
};

export class InventoryQuery {
  #client;
  #asyncCache;
  #application;

  constructor({
    apiClient,
    asyncCache,
    application,
  }: {
    apiClient: ApiClient;
    asyncCache: AsyncCache;
    application: Application;
  }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
    this.#application = application;
  }

  async executeInventoryQuery({
    queriedType,
    query,
    projectionFields,
    aggregationDefinition,
  }: ApiiroQlQueryDefinition): Promise<ApiiroQlQueryResponse> {
    if (!(queriedType && query)) {
      return {
        rows: [],
        columns: [],
        rowLimitReached: false,
      };
    }

    return (await this.#client.post('apiiroql/query', {
      queriedType,
      query,
      projectionFields,
      resultsLimit: inventoryQueryGlobalResultsLimit,
      diagnostics: true,
      aggregationDefinition,
    })) as ApiiroQlQueryResponse;
  }

  async analyzeInventoryQuery(
    { queriedType, query, projectionFields, aggregationDefinition }: ApiiroQlQueryDefinition,
    config?: any
  ): Promise<ApiiroQlQueryAnalysisResponse> {
    return (await this.#client.post(
      'apiiroql/analyze',
      {
        queriedType,
        query,
        projectionFields,
        aggregationDefinition,
      },
      config
    )) as ApiiroQlQueryAnalysisResponse;
  }

  async cachedExecuteInventoryQuery({
    queriedType,
    query,
    projectionFields,
    aggregationDefinition,
  }: ApiiroQlQueryDefinition): Promise<ApiiroQlQueryResponse> {
    return await this.#asyncCache.suspend(this.executeInventoryQuery, {
      queriedType,
      query,
      projectionFields,
      aggregationDefinition,
    });
  }

  async getInventoryQueryResults({
    queriedType,
    query,
    projectionFields,
    explorerSearchTerm,
    pageNumber,
    limit,
    aggregationDefinition,
    sortBy,
    sortDirection,
  }: any) {
    const cachedExecutionResult = await this.cachedExecuteInventoryQuery({
      queriedType,
      query,
      projectionFields,
      aggregationDefinition,
    });

    let filteredRows = cachedExecutionResult.rows;
    if (explorerSearchTerm) {
      const lowerCaseSearchTerm = explorerSearchTerm.toLowerCase();
      filteredRows = filteredRows.filter(row =>
        row.fields.find((field, index) =>
          apiiroQlResultColumnTypeDataHandlers[
            cachedExecutionResult.columns[index].type
          ].matchesSearch(field, lowerCaseSearchTerm)
        )
      );
    }

    const sortedRows = filteredRows;
    if (sortBy) {
      const fieldIndex = cachedExecutionResult.columns.findIndex(column => column.key === sortBy);
      const comparator =
        apiiroQlResultColumnTypeDataHandlers[cachedExecutionResult.columns[fieldIndex].type]
          .sortComparator;
      const sortDirectionFactor = sortDirection === 'Ascending' ? 1 : -1;
      if (comparator) {
        sortedRows.sort(
          (leftRow, rightRow) =>
            sortDirectionFactor *
            comparator(leftRow.fields[fieldIndex], rightRow.fields[fieldIndex])
        );
      }
    }

    limit = parseInt(limit);
    pageNumber = parseInt(pageNumber);

    let startItem = pageNumber * limit;
    if (startItem > filteredRows.length) {
      startItem = filteredRows.length - limit;
      if (startItem < 0) {
        startItem = 0;
      }
    }

    const slicedItems = filteredRows.slice(startItem, startItem + limit).map(item => {
      if (
        item.primaryObject &&
        isTypeOf<DiffableEntityDataModelReference>(item.primaryObject, 'diffableEntityType')
      ) {
        item.primaryObject.inventoryTableEntityType = queriedType;
      }

      return item;
    });
    return {
      items: slicedItems,
      count: filteredRows.length,
      total: filteredRows.length,
      metadata: {
        additionalResultsMayExist: cachedExecutionResult.rowLimitReached,
        projectionColumns: cachedExecutionResult.columns,
      },
    };
  }

  async getInventoryQueryResultsAsCsv({
    queriedType,
    query,
    projectionFields,
    aggregationDefinition,
  }: ApiiroQlQueryDefinition) {
    const cachedExecutionResult = await this.cachedExecuteInventoryQuery({
      queriedType,
      query,
      projectionFields,
      aggregationDefinition,
    });

    return [['key', ...cachedExecutionResult.columns.map(definition => definition.title)]]
      .concat(
        cachedExecutionResult.rows.map(item => [
          item.key,
          ...item.fields.map((field, index) =>
            apiiroQlResultColumnTypeDataHandlers[
              cachedExecutionResult.columns[index].type
            ].toString(field)
          ),
        ])
      )
      .map(lineFields => lineFields.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  getApiiroQlSchemaForQuery({ queriedType }: { queriedType: StubAny }): Promise<ApiiroQlSchema> {
    const queryParameter = queriedType ? `?queriedType=${queriedType}` : '';
    return this.#client.get(`apiiroql/schema${queryParameter}`);
  }

  async cachedGetApiiroQlSchemaForQuery(
    { queriedType }: { queriedType: StubAny } = { queriedType: null }
  ): Promise<ApiiroQlSchema> {
    return await this.#asyncCache.suspend(this.getApiiroQlSchemaForQuery, {
      queriedType,
    });
  }

  async cachedGetQExpressionSchema(
    { queriedType, schemaVariant }: { queriedType: StubAny; schemaVariant: StubAny } = {
      queriedType: null,
      schemaVariant: 'ApiiroQlRiskDiffableCondition',
    }
  ): Promise<QExpressionSchema> {
    const apiiroQlSchema = await this.#asyncCache.suspend(this.getApiiroQlSchemaForQuery, {
      queriedType,
    });

    return createQExpressionSchemaForVariant(apiiroQlSchema, schemaVariant);
  }

  async translateToExplorerQuery(
    queryText: string,
    sessionId: string,
    errorMessage: string,
    querySettings: InventoryQuerySettings
  ) {
    const encodedQueryParameters = `?queryText=${queryText}&sessionId=${sessionId}&errorMessage=${errorMessage}`;
    return await this.#client.post(
      `apiiroql/translate${encodedQueryParameters}`,
      JSON.stringify(querySettings),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  async getBetaFeatureFavoriteQueriesLibrary({
    libraryName,
  }: {
    libraryName: string;
  }): Promise<FavoritesFolder<InventoryQuerySettings>> {
    const favoriteQueries = await this.#client.get(
      `apiiroql/favorites/${libraryName}/listRecursive`
    );
    const { folderContent, name } = favoriteQueries;
    const filteredFolderContentByBetaFeature =
      this.getFavoriteQueriesLibraryByBetaFeature(folderContent);

    return { folderContent: filteredFolderContentByBetaFeature, name };
  }

  async saveFavoritesItem({
    libraryName,
    savePath,
    name,
    querySettings,
    queryUrl,
  }: {
    libraryName: string;
    savePath?: string[];
    name: string;
    querySettings: InventoryQuerySettings;
    queryUrl: string;
  }): Promise<void> {
    const { toaster } = ioc;
    try {
      await this.#client.post(`apiiroql/favorites/${libraryName}/save`, {
        savePath,
        name,
        payload: this.transformFavoritesEntryToExportedQuery(querySettings),
        queryUrl,
      });

      toaster.success(`Query saved successfully`);
    } catch (error) {
      toaster.error('Failed to save query');
    }

    this.#asyncCache.invalidate(this.getBetaFeatureFavoriteQueriesLibrary, { libraryName });
    this.#asyncCache.invalidate(this.getFavoritesFoldersNames, { libraryName });
  }

  transformFavoritesEntryToExportedQuery = (querySetting: InventoryQuerySettings) => {
    const queryObject = JSON.parse(createExportedQuerySettings(querySetting));
    return changeObjectKeys(queryObject, { $type: 'type', $version: 'version' });
  };

  transformExportedQueryToFavoritesEntry = (payload: StubAny) => {
    return changeObjectKeys(payload, { type: '$type', version: '$version' });
  };

  async createFavoritesFolder({
    libraryName,
    folderPath,
  }: {
    libraryName: string;
    folderPath?: string[];
  }): Promise<void> {
    return await this.#client.post(`apiiroql/favorites/${libraryName}/makePath`, {
      newPath: folderPath,
    });
  }

  async getFavoritesFoldersNames({ libraryName }: { libraryName: string; folderPath?: string[] }) {
    const list = await this.#client.get(`apiiroql/favorites/${libraryName}/listRecursive`);
    return (list.folderContent ?? []).map((item: StubAny) => !item.itemContent && item.name);
  }

  async moveFavoritesItem({
    libraryName,
    tree,
    position,
    from,
    to,
    errorMessage = 'Failed to move favorite query',
  }: {
    libraryName: string;
    tree: StubAny;
    position: string;
    from: string;
    to: string;
    errorMessage?: string;
  }) {
    const { toaster } = ioc;
    const root = { id: '1', children: tree };

    const fromPath = getPathById(root, from);
    fromPath.shift();

    const isOrphan = position === 'insert-above' || position === 'insert-under';

    const toPath = isOrphan ? [] : getPathById(root, to);
    toPath.shift();

    try {
      await this.#client.post(`apiiroql/favorites/${libraryName}/move`, {
        sourcePath: fromPath,
        destinationPath: [...toPath, _.last(fromPath)],
      });
      this.#asyncCache.invalidate(this.getBetaFeatureFavoriteQueriesLibrary, {
        libraryName,
      });
    } catch (e) {
      toaster.error(errorMessage);
    }
  }

  async renameFavoritesItem({
    libraryName,
    tree,
    from,
    newName,
    errorMessage = 'Failed to rename favorite query',
  }: {
    libraryName: string;
    tree: StubAny;
    from: string;
    newName: StubAny;
    errorMessage?: string;
  }) {
    const { toaster } = ioc;
    const path = getPathById(tree, from);
    path.shift();
    const destinationPath = [...path];
    destinationPath.pop();
    destinationPath.push(newName.name);

    try {
      await this.#client.post(`apiiroql/favorites/${libraryName}/move`, {
        sourcePath: path,
        destinationPath,
      });
      this.#asyncCache.invalidate(this.getBetaFeatureFavoriteQueriesLibrary, {
        libraryName,
      });
    } catch (e) {
      toaster.error(errorMessage);
    }
  }

  async logQueryExport(pathToQuery: string[], queryUrl: string) {
    await this.#client.post('apiiroql/logQueryExport', { pathToQuery, queryUrl });
  }

  async deleteFavoritesItem({
    libraryName,
    pathToDelete,
  }: {
    libraryName: string;
    pathToDelete: string[];
  }) {
    const { toaster } = ioc;

    if (pathToDelete[0] === 'Root' || pathToDelete[0] === '') {
      pathToDelete.shift();
    }
    try {
      await this.#client.post(`apiiroql/favorites/${libraryName}/delete`, {
        pathToDelete,
      });
      this.#asyncCache.invalidate(this.getBetaFeatureFavoriteQueriesLibrary, {
        libraryName,
      });
      this.#asyncCache.invalidate(this.getFavoritesFoldersNames, {
        libraryName,
      });
    } catch (e) {
      toaster.error('Failed to delete query');
    }
  }

  getFavoriteQueriesLibraryByBetaFeature(
    data: FavoritesItem<ExportedQuerySettings>[]
  ): FavoritesItem<InventoryQuerySettings>[] {
    if (data === undefined) {
      return null;
    }

    return data.flatMap(item => {
      if ('folderContent' in item) {
        const folderContent = this.getFavoriteQueriesLibraryByBetaFeature(item.folderContent);

        if (!folderContent.length) {
          return [];
        }

        return {
          ...item,
          folderContent,
        };
      }

      const queryObject = mappedInventoryQueryObjectOptions[item.itemContent?.rowset];
      if (
        queryObject &&
        (!queryObject.betaFeature || this.#application.isFeatureEnabled(queryObject.betaFeature)) &&
        (!queryObject.queryBetaFeature ||
          this.#application.isFeatureEnabled(queryObject.queryBetaFeature))
      ) {
        return item;
      }

      return [];
    });
  }
}

export function isLeafItem<TPayload>(
  favoritesItem: FavoritesItem<TPayload>
): favoritesItem is FavoritesLeafItem<TPayload> {
  return 'itemContent' in favoritesItem;
}

export function isFolderItem<TPayload>(
  favoritesItem: FavoritesItem<TPayload>
): favoritesItem is FavoritesFolder<TPayload> {
  return 'folderContent' in favoritesItem;
}

function changeObjectKeys(obj: StubAny, keyMap: StubAny) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [keyMap.hasOwnProperty(key) ? keyMap[key] : key, val])
  );
}
