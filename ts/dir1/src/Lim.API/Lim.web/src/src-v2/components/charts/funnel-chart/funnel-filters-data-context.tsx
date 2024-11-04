import _ from 'lodash';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { useSuspense } from '@src-v2/hooks';
import {
  DraggableCollectionOrderResult,
  useDraggableCollectionOrder,
} from '@src-v2/hooks/use-draggable-collection-order';
import { FunnelFilterDefinition } from '@src-v2/services';

interface FunnelFiltersDataContext extends Omit<DraggableCollectionOrderResult, 'visibleItems'> {
  visibleFunnelFilters: FunnelFilterDefinition[];
  hiddenFunnelFilters: FunnelFilterDefinition[];
}

const Context = createContext<FunnelFiltersDataContext>(null);

export function useFunnelFiltersData(): FunnelFiltersDataContext {
  return useContext(Context);
}

export function FunnelFiltersDataProvider({
  dataFetcher,
  storagePrefix,
  children,
}: {
  dataFetcher: () => Promise<FunnelFilterDefinition[]>;
  storagePrefix?: string;
  children: ReactNode;
}) {
  const trackAnalytics = useTrackAnalytics();
  const originalFilters = useSuspense(dataFetcher);
  const defaultOrder = initFiltersStorage(originalFilters);

  const onOrderChanged = (filterKeys: string[]) =>
    trackAnalytics(AnalyticsEventName.ActionInvoked, {
      [AnalyticsDataField.FunnelReordered]: filterKeys.join(', '),
    });

  const onToggleVisibility = (filterKey: string, isVisible: boolean) =>
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.FunnelBarVisibilityChanged]: isVisible ? 'Visible' : 'Hidden',
      [AnalyticsDataField.FunnelBarKey]: filterKey,
    });

  const { visibleItems, ...draggableCollectionOrderProps } = useDraggableCollectionOrder(
    storagePrefix ? `${storagePrefix}_funnel_filters` : null,
    defaultOrder,
    onOrderChanged,
    onToggleVisibility
  );

  const [visibleFunnelFilters, hiddenFunnelFilters] = useMemo(() => {
    const disabledFiltersKeys = originalFilters
      .filter(filterDefinition => Boolean(filterDefinition.disabledReasonMarkdown))
      .map(filterDefinition => filterDefinition.key);

    const [visibleFilters, hiddenFilters] = _.partition(
      originalFilters,
      filter => visibleItems.includes(filter.key) && !disabledFiltersKeys.includes(filter.key)
    );

    return [
      _.orderBy(visibleFilters, filter => visibleItems.indexOf(filter.key)),
      _.orderBy(hiddenFilters, 'isAdditional', 'desc'),
    ] as const;
  }, [originalFilters, visibleItems]);

  return (
    <Context.Provider
      value={{
        visibleFunnelFilters,
        hiddenFunnelFilters,
        ...draggableCollectionOrderProps,
      }}>
      {children}
    </Context.Provider>
  );
}

function initFiltersStorage(funnelFilterDefinitions: FunnelFilterDefinition[]) {
  return funnelFilterDefinitions
    ?.filter(
      filterDefinition => !filterDefinition.isAdditional && !filterDefinition.disabledReasonMarkdown
    )
    .map(filter => filter.key);
}
