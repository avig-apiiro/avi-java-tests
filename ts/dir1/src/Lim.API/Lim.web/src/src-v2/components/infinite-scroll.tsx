import { observer } from 'mobx-react';
import React, { ElementType, ReactNode, forwardRef, useCallback } from 'react';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { useInfiniteScroll } from '@src-v2/hooks/use-infinite-scroll';
import { ISearchState, PersistentSearchState } from '@src-v2/models/search-state';

type InfiniteScrollProps<T> = {
  as?: ElementType;
  scrollParent?: HTMLElement | null;
  disabled?: boolean;
  searchState: ISearchState<T> | PersistentSearchState<T>;
  children: ReactNode;
};

const Container = styled.div``;

export const InfiniteScroll: React.FC<InfiniteScrollProps<any>> = observer(
  forwardRef<HTMLDivElement, InfiniteScrollProps<any>>(
    (
      {
        as = 'div',
        scrollParent = document.getElementById('main'),
        disabled,
        searchState = {} as ISearchState<any>,
        children,
        ...props
      },
      ref
    ) => {
      useInfiniteScroll(
        scrollParent,
        useCallback(() => !searchState.loading && searchState.loadMore?.(), [searchState]),
        { disabled: disabled ?? (!searchState.hasMore || !scrollParent) }
      );

      return (
        <Container ref={ref} as={as} {...props}>
          {children}
          {searchState.loading && <DataLoader />}
        </Container>
      );
    }
  )
);

const DataLoader = styled(props => (
  <div {...props}>
    <LogoSpinner />
  </div>
))`
  margin-top: 8rem;
  text-align: center;
`;
