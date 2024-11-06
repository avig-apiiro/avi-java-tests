import { useState } from 'react';
import { useDeepObserver } from '@src-v2/hooks/use-deep-observer';
import { useFilters } from '@src-v2/hooks/use-filters';
import { useQueryParams } from '@src-v2/hooks/use-navigation';
import { useSearchState } from '@src-v2/hooks/use-search-state';
import { DataTableGrouping } from '@src-v2/models/data-table-grouping';
import { AggregationResult } from '@src-v2/types/aggregation-result';

type OptionalMetadata<M> = M extends object ? { metadata: M } : {};

export function useDataTableGrouping<TRow extends { key: string }, TMetadata = 0>(
  asyncHandler: (params?: any) => Promise<AggregationResult<TRow> & OptionalMetadata<TMetadata>>,
  {
    namespace,
    searchParams,
    pageNumber,
    limit,
    groupBy,
    onSetPageNumber,
    onSetLimit,
    ...options
  }: any = {}
) {
  const { queryParams } = useQueryParams();
  const {
    activeFilters: { searchTerm, operator, ...filters },
  } = useFilters(namespace);

  const searchState = useSearchState<TRow, TMetadata>(asyncHandler, {
    limit: limit ?? queryParams.pageSize ?? '20',
    pageNumber: pageNumber ?? queryParams.page ?? '0',
    onSetPageNumber,
    onSetLimit,
    searchTerm,
    filters,
    operator,
    groupBy,
    ...searchParams,
  });

  const [dataGroupingModel, setDataGroupingModel] = useState(
    () =>
      new DataTableGrouping<TRow, TMetadata>({
        searchState,
        searchParams,
        ...options,
      })
  );

  useDeepObserver(
    () =>
      setDataGroupingModel(
        new DataTableGrouping<TRow, TMetadata>({
          searchState,
          searchParams,
          ...options,
        })
      ),
    { searchState, ...options }
  );

  return dataGroupingModel;
}
