import { useCallback } from 'react';
import { LoadOptions } from 'react-select-async-paginate';
import { GroupBase } from 'react-select/dist/declarations/src/types';
import { AsyncSelectProps } from '@src-v2/components/select/select-props';
import { SearchParams } from '@src-v2/services';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export function useLoadOptions<TOption, TGroup extends GroupBase<TOption>>(
  searchMethod: AsyncSelectProps<TOption, TGroup>['searchMethod']
): LoadOptions<TOption, TGroup, Partial<SearchParams>> {
  return useCallback(
    async (searchTerm, totalOptions, searchParams = {}) => {
      const result = await searchMethod({ ...searchParams, searchTerm });
      return isTypeOf<AggregationResult<TOption | TGroup>>(result, 'total')
        ? {
            options: result.items,
            hasMore: totalOptions.length < result.count,
            additional: {
              ...searchParams,
              limit: searchParams.limit ?? 20,
              pageNumber: (searchParams.pageNumber ?? 0) + 1,
            },
          }
        : Promise.resolve({
            options: result,
            hasMore: false,
          });
    },
    [searchMethod]
  );
}
