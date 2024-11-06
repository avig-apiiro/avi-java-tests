import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import {
  BaseListBoxItem,
  DualListBoxProps,
} from '@src-v2/components/forms/dual-list-box/dual-list-box';
import { ListBoxDisplay } from '@src-v2/components/forms/dual-list-box/list-box-display';
import { InfiniteScroll } from '@src-v2/components/infinite-scroll';
import { UnorderedList } from '@src-v2/components/typography';
import { usePersistentSearchState } from '@src-v2/hooks/use-search-state';
import { SearchState } from '@src-v2/models/search-state';

type PersistentMainListBoxProps<TItem, TSearchParams> = Pick<
  DualListBoxProps<TItem, TSearchParams>,
  'searchParams' | 'searchMethod' | 'keyBy'
> & {
  excludeKeys: string[];
};

export const PersistentMainListBox = observer(
  <TItem extends BaseListBoxItem, TSearchParams>({
    searchParams: rawSearchParams,
    excludeKeys = [],
    ...props
  }: PersistentMainListBoxProps<TItem, TSearchParams>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const searchParams = useMemo(
      () => ({ ...rawSearchParams, searchTerm }),
      [rawSearchParams, searchTerm]
    );

    const [{ total, count }, setResultCounters] = useState({ total: 0, count: 0 });
    const selectedKeysCount = excludeKeys.length;

    const handleLoad = useCallback(
      ({ total, count }: SearchState<TItem, TSearchParams>) =>
        setResultCounters({
          total,
          count,
        }),
      []
    );

    return (
      <ListBoxDisplay
        data-main
        count={Math.max(0, count - selectedKeysCount)}
        total={total - selectedKeysCount}
        onSearch={setSearchTerm}>
        <AsyncBoundary>
          <PersistentList
            {...props}
            searchParams={searchParams}
            excludeKeys={excludeKeys}
            onLoad={handleLoad}
          />
        </AsyncBoundary>
      </ListBoxDisplay>
    );
  }
);

const PersistentList = observer(
  <TItem extends BaseListBoxItem, TSearchParams>({
    keyBy,
    searchMethod,
    searchParams,
    excludeKeys = [],
    onLoad,
  }: PersistentMainListBoxProps<TItem, TSearchParams> & {
    onLoad: (searchState: SearchState<TItem>) => void;
  }) => {
    const searchState = usePersistentSearchState(searchMethod, searchParams);

    useEffect(() => {
      onLoad(searchState);
    }, [searchState.items]);

    const availableItems = useMemo(() => {
      const keysDict = _.keyBy(excludeKeys);
      return searchState.items.filter(item => !keysDict[keyBy?.(item) ?? item.key]);
    }, [keyBy, searchState?.items.length, excludeKeys]);

    useEffect(() => {
      if (
        !searchState.loading &&
        searchState.hasMore &&
        availableItems.length <= searchState.limit
      ) {
        searchState.loadMore();
      }
    }, [availableItems, searchState]);

    const InfiniteScrollListElement = useMemo(
      () =>
        ({ children, scrollParent }) => (
          <InfiniteScroll scrollParent={scrollParent} as={UnorderedList} searchState={searchState}>
            {children}
          </InfiniteScroll>
        ),
      [searchState]
    );

    return (
      <ListBoxDisplay.Content items={availableItems} listElement={InfiniteScrollListElement} />
    );
  }
);
