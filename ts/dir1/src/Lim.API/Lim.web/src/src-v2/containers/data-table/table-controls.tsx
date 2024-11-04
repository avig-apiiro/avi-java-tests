import { animated } from '@react-spring/web';
import { observer } from 'mobx-react';
import { ReactNode, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { AnalyticsEventName, useTrackAnalytics } from '@src-v2/components/analytics-layer';
import { Skeleton } from '@src-v2/components/animations/skeleton';
import { SearchFilterInput } from '@src-v2/components/forms/search-input';
import { TableControls } from '@src-v2/components/table/table-addons';
import { useQueryParams } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { DataTable } from '@src-v2/models/data-table';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { formatNumber } from '@src-v2/utils/number-utils';

export const TableSearch = ({ namespace = 'fl', ...props }) => {
  const { activeFilters } = useFilters(namespace);
  const { updateQueryParams } = useQueryParams();
  const trackAnalytics = useTrackAnalytics();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeFilters.searchTerm && inputRef.current?.value) {
      inputRef.current.value = '';
    }
  }, [activeFilters.searchTerm]);

  return (
    <SearchFilterInput
      {...props}
      ref={inputRef}
      namespace={namespace}
      defaultValue={activeFilters.searchTerm}
      onChange={() => {
        updateQueryParams({ page: null });
        trackAnalytics(AnalyticsEventName.Search);
      }}
    />
  );
};

export const TableCounter = observer(
  <T extends { key: string }, TMetadata extends any = never>({
    dataModel,
    itemName = 'results',
  }: {
    dataModel: DataTable<T, TMetadata>;
    itemName?: string;
  }) => {
    const {
      selection: { length: selectionSize },
      searchState: { count, total, isLoadingCounters },
    } = dataModel;

    //Taking care in cases when the count number is greater than the total value due to the way the backend caching system works.
    const totalCount = useMemo(() => Math.max(count, total), [count, total]);

    return (
      <SelectedCount>
        {isLoadingCounters ? (
          <Skeleton.Text length={20} />
        ) : (
          <>
            {selectionSize > 0 && <>{formatNumber(selectionSize)} Selected / </>}
            {formatNumber(count)}{' '}
            {totalCount && count !== totalCount ? `out of ${formatNumber(totalCount)}` : null}{' '}
            {itemName}
          </>
        )}
      </SelectedCount>
    );
  }
);

export function TableConditionalActions({
  shouldDisplay,
  children,
}: {
  shouldDisplay?: boolean;
  children: ReactNode;
}) {
  return (
    <AnimationWrapper data-display={dataAttr(shouldDisplay)}>
      {shouldDisplay ? <ActionsContainer>{children}</ActionsContainer> : null}
    </AnimationWrapper>
  );
}

export const SelectedCount = styled(TableControls.Counter)`
  display: flex;
  align-items: center;
  font-size: var(--font-size-s);
`;

const AnimationWrapper = styled(animated.div)`
  display: flex;
  align-items: flex-start;
  height: 0;
  transition: height 0.35s var(--ease-in-out-quad);

  &[data-display] {
    height: 15rem;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: 3rem;
  border-top: 0.25rem solid var(--color-blue-gray-20);
  margin-bottom: 2rem;
  gap: 2rem;
`;
