import { useMemo } from 'react';
import { SORT } from '@src-v2/containers/data-table/table-header-controls';
import { defaultSorter } from '@src-v2/hooks/sorters';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { ActiveFiltersData, useFilters } from '@src-v2/hooks/use-filters';
import { SearchParams } from '@src-v2/services';
import { AggregationResult } from '@src-v2/types/aggregation-result';

export type ClientFilterFunction<T> = (
  item: T,
  params: { filters: ActiveFiltersData; searchTerm: string }
) => boolean;

function searchDataTable<T>({
  dataset = [],
  filterItemFunction,
  limit: rawLimit,
  pageNumber: rawPageNumber,
  filters,
  searchTerm,
}: SearchParams & {
  dataset: T[];
  filterItemFunction?: ClientFilterFunction<T>;
}): Promise<AggregationResult<T>> {
  const limit = Number(rawLimit);
  const pageNumber = Number(rawPageNumber);

  const filteredDataset =
    dataset?.filter(item =>
      filterItemFunction ? filterItemFunction(item, { filters, searchTerm }) : true
    ) ?? [];
  const currentPage = filteredDataset.slice(limit * pageNumber, limit * (pageNumber + 1));

  return Promise.resolve({
    items: currentPage,
    count: filteredDataset?.length ?? 0,
    total: dataset?.length,
  });
}

function useClientSort<T>(dataTableOptions: any, dataset: T[]) {
  const { activeSort } = useFilters();

  return useMemo(() => {
    const customSorter = dataTableOptions.columns.find(
      (column: any) => column.key === activeSort.sortBy
    )?.customSorter;

    if (!activeSort.sortBy) {
      return dataset;
    }

    const sortedItems = [...dataset].sort((firstItem, secondItem) => {
      const firstValue = firstItem[activeSort.sortBy as keyof T];
      const secondValue = secondItem[activeSort.sortBy as keyof T];

      if (customSorter) {
        return customSorter(firstValue, secondValue);
      }

      return defaultSorter(firstValue, secondValue, activeSort.sortDirection);
    });

    return activeSort.sortDirection === SORT.ASC ? sortedItems : sortedItems.reverse();
  }, [dataset, activeSort]);
}

export function useClientDataTable<T extends { key: string }>(
  dataset: T[],
  dataTableOptions: any,
  filterItemFunction?: ClientFilterFunction<T>
) {
  const sortedDataset = useClientSort(dataTableOptions, dataset);

  return useDataTable(searchDataTable<T>, {
    ...dataTableOptions,
    searchParams: {
      ...(dataTableOptions?.searchParams ?? {}),
      dataset: sortedDataset,
      filterItemFunction,
    },
  });
}
