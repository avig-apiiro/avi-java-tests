import { useEffect, useMemo, useRef, useState } from 'react';
import { useDeepObserver } from '@src-v2/hooks/use-deep-observer';
import { useInject } from '@src-v2/hooks/use-inject';
import { PersistentSearchState, SearchState } from '@src-v2/models/search-state';
import { SearchParams } from '@src-v2/services';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { StubAny } from '@src-v2/types/stub-any';

export const defaultAsyncCount = () => Promise.resolve(null);

export function useSearchState<T, A = never>(
  asyncHandler: (searchParams: any) => Promise<AggregationResult<any>>,
  searchRequestParams: any,
  counterRequestsParams?: any,
  asyncTotalCount?: (params: Pick<SearchParams, 'searchTerm' | 'filters'>) => Promise<number>,
  asyncFilteredCount?: (params: Pick<SearchParams, 'searchTerm' | 'filters'>) => Promise<number>,
  ...rest: StubAny
): SearchState<T, A> {
  const requestPromise = useInject().asyncCache.suspend(asyncHandler, searchRequestParams, ...rest);
  const requestTotalCountPromise = useInject().asyncCache.suspend(
    asyncTotalCount ?? defaultAsyncCount,
    counterRequestsParams
  );
  const requestFilteredCountPromise = useInject().asyncCache.suspend(
    asyncFilteredCount ?? defaultAsyncCount,
    counterRequestsParams
  );
  const [searchState] = useState(() => new SearchState<T, A>());

  const splitObserve = useMemo(
    () => Boolean(asyncFilteredCount) && Boolean(asyncTotalCount),
    [asyncFilteredCount, asyncTotalCount]
  );

  useEffect(
    () => searchState.observeRequest(requestPromise, searchRequestParams, splitObserve),
    [requestPromise, requestFilteredCountPromise, splitObserve]
  );

  useEffect(() => {
    if (asyncTotalCount) {
      searchState.observeTotalCountPromise(requestTotalCountPromise);
    }
  }, [requestFilteredCountPromise]);

  useEffect(() => {
    if (asyncFilteredCount) {
      searchState.observeFilteredCountRequest(requestFilteredCountPromise);
    }
  }, [requestFilteredCountPromise]);

  return searchState;
}

export function usePersistentSearchState<T>(
  asyncHandler: (args: any) => Promise<AggregationResult<T>>,
  params: StubAny,
  options = { ignoreInit: false }
): PersistentSearchState<T> {
  const { asyncCache } = useInject();
  const cachedPromises = useRef(null);
  const [searchState, setSearchState] = useState(() => new PersistentSearchState<T>());
  const searchParams = { ...searchState.params, ...params };
  const responsePromise = asyncCache.suspend(asyncHandler, searchParams);
  cachedPromises.current ??= new Set([responsePromise]);

  if (!options.ignoreInit) {
    cachedPromises.current.forEach((promise: StubAny) => promise.read());
  }

  function reset() {
    cachedPromises.current = null;
    setSearchState(new PersistentSearchState<T>());
  }

  function listener(params: StubAny) {
    typeof params === 'undefined' && reset();
  }

  useDeepObserver(reset, params);

  useEffect(() => {
    if (cachedPromises.current) {
      searchState.observeRequest(responsePromise, searchParams);
      responsePromise.then(() => cachedPromises.current.add(responsePromise));
    }
  }, [searchState, responsePromise]);

  useEffect(() => {
    asyncCache.addListener(asyncHandler, listener);
    return () => asyncCache.removeListener(asyncHandler, listener);
  }, [asyncHandler]);

  return searchState;
}
