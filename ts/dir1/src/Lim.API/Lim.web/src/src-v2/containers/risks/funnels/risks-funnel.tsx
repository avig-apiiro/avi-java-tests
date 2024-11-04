import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useFunnelFiltersData } from '@src-v2/components/charts/funnel-chart/funnel-filters-data-context';
import { DataFunnel, DataFunnelProps } from '@src-v2/components/data-funnel/data-funnel';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { useInject } from '@src-v2/hooks';
import { ActiveFiltersData, FilterOperation, useFilters } from '@src-v2/hooks/use-filters';
import { FunnelFilterDefinition } from '@src-v2/services';
import { entries } from '@src-v2/utils/ts-utils';

export function RisksFunnel({
  dataFetcher,
  colorsMapper,
  onLegendClick,
  readOnly = false,
  enablePopoverClick = false,
  suspendFilterOptions,
  baseUrl,
  onSegmentClick,
}: Pick<DataFunnelProps, 'dataFetcher' | 'colorsMapper' | 'readOnly'> & {
  baseUrl?: string;
  enablePopoverClick?: boolean;
  suspendFilterOptions?: boolean;
  onSegmentClick?: (operations: ActiveFiltersData) => void;
  onLegendClick?: (legend: string) => void;
}) {
  const { asyncCache } = useInject();
  const { activeFilters, updateFilters, initialized: filtersInitialized } = useFilters();

  const history = useHistory();

  const dataFetcherWrapping: DataFunnelProps['dataFetcher'] = useCallback(
    args => {
      if (suspendFilterOptions && !filtersInitialized) {
        return;
      }

      return asyncCache.suspend(dataFetcher, args);
    },
    [dataFetcher, suspendFilterOptions, filtersInitialized]
  );

  const dashboardFilters = useOverviewFilters();
  const makeOverviewUrl = useMakeOverviewUrl();

  const activeFunnelFilters = useMemo<ActiveFiltersData>(() => {
    return { ...activeFilters, ...dashboardFilters.activeFilters };
  }, [activeFilters, dashboardFilters.activeFilters]);

  const { visibleFunnelFilters } = useFunnelFiltersData();

  const handleClick = useCallback(
    (segmentIndex: number) => {
      if (onSegmentClick) {
        const segmentFilters = buildQueryFromSegmentValues(visibleFunnelFilters, segmentIndex - 1);
        onSegmentClick(segmentFilters);
        return;
      }

      updateFilters(buildFilterOperations(visibleFunnelFilters, segmentIndex - 1));
    },
    [visibleFunnelFilters, updateFilters]
  );

  const handlePopoverClick = useCallback(
    (segmentIndex: number, _: FunnelFilterDefinition, riskLevel: string) => {
      const segmentFilters = buildQueryFromSegmentValues(visibleFunnelFilters, segmentIndex - 1);

      history.push(
        makeOverviewUrl({
          baseUrl,
          query: { RiskLevel: [riskLevel], ...segmentFilters },
        })
      );
    },
    [visibleFunnelFilters, updateFilters]
  );

  const handleRemove = useCallback(
    (filterToRemove: FunnelFilterDefinition) =>
      updateFilters(
        buildFilterOperationsForRemoval(visibleFunnelFilters, activeFilters, filterToRemove)
      ),
    [visibleFunnelFilters, updateFilters]
  );

  return (
    <DataFunnel
      defaultItemLabel="Open risks"
      dataFetcher={dataFetcherWrapping}
      activeFilters={activeFunnelFilters}
      colorsMapper={colorsMapper}
      readOnly={readOnly}
      onSegmentClick={handleClick}
      onPopoverClick={enablePopoverClick ? handlePopoverClick : undefined}
      onLegendClick={onLegendClick}
      onSegmentRemoved={!readOnly ? handleRemove : null}
    />
  );
}

function buildQueryFromSegmentValues(
  controlledFilters: FunnelFilterDefinition[],
  activeFilterIndex: number
): ActiveFiltersData {
  const operations = buildFilterOperations(controlledFilters, activeFilterIndex).filter(
    t => t.checked
  );

  const grouped = _.groupBy(operations, 'key');
  const groupedValues = _.mapValues(grouped, group => _.uniq(group.map(obj => obj.value)));

  return entries(groupedValues).reduce(
    (activeFiltersData, [filterKey, values]) => ({
      ...activeFiltersData,
      [filterKey]: { values, operator: filterKey === 'RiskInsights' ? 'And' : undefined },
    }),
    {
      searchTerm: null,
      group: null,
      operator: null,
    }
  );
}

function buildFilterOperations(
  controlledFilters: FunnelFilterDefinition[],
  activeFilterIndex: number
) {
  return controlledFilters.flatMap((filter, index) =>
    filter.values.map<FilterOperation>(value => ({
      key: filter.tableFilter,
      value,
      checked: index <= activeFilterIndex,
      multiple: true,
      operator: filter.tableFilter === 'RiskInsights' ? 'And' : undefined,
    }))
  );
}

function buildFilterOperationsForRemoval(
  allFilters: FunnelFilterDefinition[],
  activeFilters: ActiveFiltersData,
  filterToRemove: FunnelFilterDefinition
) {
  return allFilters.flatMap(filter =>
    filter.values.map<FilterOperation>(value => ({
      key: filter.tableFilter,
      value,
      checked:
        filter.key === filterToRemove.key
          ? false
          : Boolean(activeFilters[filter.tableFilter]?.values?.includes(value)),
      multiple: true,
      operator: filter.tableFilter === 'RiskInsights' ? 'And' : undefined,
    }))
  );
}
