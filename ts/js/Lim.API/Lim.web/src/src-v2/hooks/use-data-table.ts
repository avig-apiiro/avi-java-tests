import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useDeepObserver } from '@src-v2/hooks/use-deep-observer';
import { SortOptions, useFilters } from '@src-v2/hooks/use-filters';
import { useInject } from '@src-v2/hooks/use-inject';
import { useQueryParams } from '@src-v2/hooks/use-navigation';
import { useSearchState } from '@src-v2/hooks/use-search-state';
import { DataTable, DataTableParams, loadTableSavedView } from '@src-v2/models/data-table';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { Column } from '@src-v2/types/table';

type OptionalMetadata<M> = M extends object
  ? {
      metadata: M;
    }
  : {};

type UseDataModelParams<
  TRow extends {
    key: string;
  },
  TMetadata = never,
> = {
  key?: string;
  namespace?: string;
  columns: Column<TRow>[];
  searchParams?: any;
  pageNumber?: number;
  limit?: number;
  activeSort?: SortOptions;
  onSetActiveSort?: (value: SortOptions) => void;
  onSetPageNumber?: (value: number) => void;
  onSetLimit?: (value: number) => void;
} & Pick<
  DataTableParams<TRow, TMetadata>,
  | 'key'
  | 'selectable'
  | 'ignorePagination'
  | 'isPinFeatureEnabled'
  | 'hasToggleColumns'
  | 'hasReorderColumns'
>;

export function useDataTable<
  TRow extends {
    key: string;
  },
  TMetadata = 0,
>(
  asyncHandler: (params?: any) => Promise<AggregationResult<TRow> & OptionalMetadata<TMetadata>>,
  {
    namespace,
    searchParams,
    columns,
    pageNumber,
    limit,
    activeSort,
    onSetPageNumber,
    onSetLimit,
    onSetActiveSort,
    ...options
  }: UseDataModelParams<TRow, TMetadata>,
  asyncTotalCount?: (params: any) => Promise<number>,
  asyncFilteredCount?: (params: any) => Promise<number>
) {
  const { application } = useInject();
  const { queryParams } = useQueryParams();
  const {
    activeFilters: { searchTerm, operator, ...filters },
    updateSort: updateSortInFilters,
  } = useFilters(namespace);

  let {
    activeSort: { sortBy, sortDirection },
  } = useFilters(namespace);

  if (activeSort) {
    sortBy = activeSort.name;
    sortDirection = activeSort.sortDirection;
  }

  onSetActiveSort ??= updateSortInFilters;

  const filteredTableColumns = useMemo(() => {
    const [hidden, shown] = _.partition(columns, 'hidden');
    return [...shown, ...hidden].filter(
      column => !column.betaFeature || application.isFeatureEnabled(column.betaFeature)
    );
  }, [columns]);

  const counterRequestsParams = {
    searchTerm,
    operator,
    ...searchParams,
    filters: {
      ...filters,
      ...(searchParams?.filters ?? {}),
    },
  };

  const searchRequestParams = {
    ...counterRequestsParams,
    limit: limit ?? queryParams.pageSize ?? '20',
    pageNumber: options.ignorePagination ? '0' : pageNumber ?? queryParams.page ?? '0',
    onSetPageNumber,
    onSetLimit,
    onSetActiveSort,
    sortBy,
    sortDirection,
  };
  const searchState = useSearchState<TRow, TMetadata>(
    asyncHandler,
    searchRequestParams,
    counterRequestsParams,
    asyncTotalCount,
    asyncFilteredCount
  );

  const syncedColumns = useMemo(
    () =>
      loadTableSavedView({
        key: options.key,
        tableColumns: filteredTableColumns,
      }),
    [filteredTableColumns, loadTableSavedView, options.key]
  );

  const [dataModel, setDataModel] = useState(
    () =>
      new DataTable<TRow, TMetadata>({
        searchState,
        columns: syncedColumns,
        namespace,
        ...options,
      })
  );

  useDeepObserver(
    () =>
      setDataModel(
        new DataTable<TRow, TMetadata>({
          columns: syncedColumns,
          searchState,
          namespace,
          ...options,
        })
      ),
    { ...options, columns: syncedColumns }
  );

  return dataModel;
}
