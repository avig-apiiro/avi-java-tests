import { useCallback } from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { FunnelDrawer } from '@src-v2/components/charts/funnel-chart/funnel-drawer';
import { FunnelFiltersDataProvider } from '@src-v2/components/charts/funnel-chart/funnel-filters-data-context';
import { DataFunnel, DataFunnelProps } from '@src-v2/components/data-funnel/data-funnel';
import { Gutters } from '@src-v2/components/layout';
import { risksFunnelColors } from '@src-v2/data/risks-funnel';
import { FilterOperation, useFilters } from '@src-v2/hooks/use-filters';
import { FunnelFilterDefinition } from '@src-v2/services';

interface ConsumableDataFunnelProps {
  label: string;
  filtersDataFetcher: () => Promise<FunnelFilterDefinition[]>;
  segmentsDataFetcher: DataFunnelProps['dataFetcher'];
}

export function ConsumableDataFunnel({
  label,
  segmentsDataFetcher,
  filtersDataFetcher,
}: ConsumableDataFunnelProps) {
  const { activeFilters, updateFilters } = useFilters();

  const handleSegmentClick = useCallback(
    (
      activeFilterIndex: number,
      _: FunnelFilterDefinition,
      visibleFilters: FunnelFilterDefinition[]
    ) => {
      const operations = visibleFilters.flatMap<FilterOperation>((filter, index) =>
        filter.values.map(value => ({
          key: filter.tableFilterGroup ?? filter.tableFilter,
          value: filter.tableFilterGroup ? filter.tableFilter : value,
          checked: index < activeFilterIndex,
          multiple: true,
        }))
      );

      updateFilters(operations);
    },
    [updateFilters]
  );

  const handleLegendClick = useCallback(
    (legend: string) =>
      updateFilters({
        key: 'RiskLevel',
        value: [legend],
      }),
    [updateFilters]
  );

  const handleSegmentRemoved = useCallback(
    (removedFilter: FunnelFilterDefinition, visibleFilters: FunnelFilterDefinition[]) => {
      const operations = visibleFilters.flatMap<FilterOperation>(filter =>
        filter.values.map(value => ({
          key: filter.tableFilterGroup ?? filter.tableFilter,
          value,
          checked:
            filter.key === removedFilter.key
              ? false
              : Boolean(
                  activeFilters[filter.tableFilterGroup ?? filter.tableFilter]?.values?.includes(
                    value
                  )
                ),
          multiple: true,
        }))
      );

      updateFilters(operations);
    },
    [activeFilters]
  );

  return (
    <Container>
      <FunnelFiltersDataProvider dataFetcher={filtersDataFetcher}>
        <FunnelDrawer defaultItemLabel={label}>
          <AsyncBoundary>
            <DataFunnel
              defaultItemLabel={label}
              dataFetcher={segmentsDataFetcher}
              activeFilters={activeFilters}
              colorsMapper={risksFunnelColors.bySeverity}
              onSegmentClick={handleSegmentClick}
              onLegendClick={handleLegendClick}
              onSegmentRemoved={handleSegmentRemoved}
            />
          </AsyncBoundary>
        </FunnelDrawer>
      </FunnelFiltersDataProvider>
    </Container>
  );
}

const Container = styled(Gutters)`
  margin-top: 6rem;
`;
