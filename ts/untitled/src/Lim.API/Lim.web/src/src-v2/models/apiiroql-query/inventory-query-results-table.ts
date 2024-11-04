import { useCallback, useEffect, useState } from 'react';
import { useInject } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { SortOptions } from '@src-v2/hooks/use-filters';
import { DataTable } from '@src-v2/models/data-table';
import { ApiiroQlQueryDefinition, ApiiroQlQueryResultColumn } from '@src-v2/services';
import { ApiiroQlQueryResultRow } from '@src-v2/types/apiiro-query-languange/apiiro-ql-query-result-row';

type InventoryQueryResultsTableOptions = {
  columnsGenerator: (columnDefinitions: ApiiroQlQueryResultColumn[]) => any[];
};

export type InventoryQueryResultsTable = {
  resultsDataModel: DataTable<ApiiroQlQueryResultRow, object>;

  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;

  executeQuery: (query: ApiiroQlQueryDefinition) => void;

  lastExecutedQueryDefinition: ApiiroQlQueryDefinition;
  additionalResultsMayExist: boolean;
};

export function useInventoryQueryResultsTable({
  columnsGenerator,
}: InventoryQueryResultsTableOptions): InventoryQueryResultsTable {
  const { session, inventoryQuery } = useInject();
  const [lastExecutedQueryDefinition, setLastExecutedQueryDefinition] =
    useState<ApiiroQlQueryDefinition>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const [pageNumber, onSetPageNumber] = useState<number>(0);
  const [limit, onSetLimit] = useState<number>(20);
  const [activeSort, onSetActiveSort] = useState<SortOptions>();

  const [inventoryListColumns, setInventoryListColumns] = useState([]);

  const resultsDataModel = useDataTable(inventoryQuery.getInventoryQueryResults, {
    key: `${session?.data?.environmentId}-explorer`,
    columns: inventoryListColumns,
    searchParams: {
      ...lastExecutedQueryDefinition,
      explorerSearchTerm: searchTerm,
    },
    pageNumber,
    limit,
    onSetPageNumber,
    onSetLimit,
    activeSort,
    onSetActiveSort,
  });

  useEffect(() => {
    setInventoryListColumns(
      columnsGenerator(resultsDataModel?.searchState?.metadata?.projectionColumns || [])
    );
  }, [resultsDataModel?.searchState?.metadata?.projectionColumns]);

  const executeQuery = useCallback(
    (query: ApiiroQlQueryDefinition) => {
      resultsDataModel.searchState.metadata.additionalResultsMayExist = false;
      setLastExecutedQueryDefinition({ ...query });
      setSearchTerm(undefined);
      onSetPageNumber(0);
    },
    [setLastExecutedQueryDefinition, setSearchTerm, onSetPageNumber, resultsDataModel]
  );

  return {
    resultsDataModel,
    executeQuery,
    setSearchTerm,
    searchTerm,
    lastExecutedQueryDefinition,
    additionalResultsMayExist: resultsDataModel?.searchState?.metadata?.additionalResultsMayExist,
  };
}
