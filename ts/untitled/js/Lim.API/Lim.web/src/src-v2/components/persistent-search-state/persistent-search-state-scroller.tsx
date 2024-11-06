import { observer } from 'mobx-react';
import { FC, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { ErrorLayout } from '@src-v2/components/layout';
import { ScrollSyncContext } from '@src-v2/components/scroll-sync';
import { ScrollToTop } from '@src-v2/components/scroll-to-top';
import { useQueryParams } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { usePersistentSearchState } from '@src-v2/hooks/use-search-state';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { InfiniteScroll } from '../infinite-scroll';

interface SearchPageProps<T> {
  dataFetcher: (args: any) => Promise<AggregationResult<T>>;
  sortFetcher?: (args: any) => Promise<any[]>;
  defaultSortOrder?: string;
  onSearchStateChanged?: ({ count, total }: { count: number; total: number }) => void;
  itemRender: FC<{ item: T }>;
  itemTypeDisplayName?: string;
  emptyState?: ReactNode;
}

export const PersistentSearchStateScroller = observer(PlainScroller);

function PlainScroller<T>({
  dataFetcher,
  defaultSortOrder,
  onSearchStateChanged,
  itemRender: ItemRender,
  emptyState: EmptyState = <ErrorLayout.NoResults />,
}: SearchPageProps<T>) {
  const { queryParams } = useQueryParams();
  const { activeFilters } = useFilters();

  const { searchTerm, operator, ...filters } = activeFilters;
  const searchState = usePersistentSearchState(dataFetcher, {
    sort: queryParams.sort ?? defaultSortOrder,
    searchTerm,
    operator,
    filters,
  });

  useEffect(() => {
    onSearchStateChanged?.({ count: searchState.count, total: searchState.total });
  }, [searchState?.count]);

  return (
    <InfiniteScroll searchState={searchState}>
      {searchState.items.length === 0 ? (
        <EmptyContainer>{EmptyState}</EmptyContainer>
      ) : (
        <ScrollSyncContext>
          <Container>
            {searchState.items.map((item, index) => (
              <ItemRender key={index} item={item} />
            ))}
            <ScrollToTop />
          </Container>
        </ScrollSyncContext>
      )}
    </InfiniteScroll>
  );
}

const EmptyContainer = styled.div`
  text-align: center;
`;

const Container = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-flow: column;
  padding-bottom: 10rem;
  gap: 4rem;
`;
