import { useEffect, useRef, useState } from 'react';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { deriveDatesFromRange } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/derrive-dates-from-range';
import { Overview } from '@src-v2/services';
import { RiskAgeRange, RiskLevelsCountByAgeRange } from '@src-v2/types/overview/overview-responses';

export const useFetchRisksByAgeAndSeverityData = (
  ageRanges: RiskAgeRange[],
  overview: Overview,
  onLoad: () => void,
  onReload: () => void
) => {
  const { activeFilters = {} } = useOverviewFilters();
  const fetchRangeData = async (
    range: RiskAgeRange[number]
  ): Promise<{ riskLevelCounts: RiskLevelsCountByAgeRange }> => {
    const rangeFilter = deriveDatesFromRange(range).map(date => date.toISOString());
    return await overview.getRiskLevelsCountByAgeRange({
      filters: { ...activeFilters, DashboardDateRange: { values: rangeFilter } },
    });
  };

  const initialState = ageRanges.reduce<Record<RiskAgeRange[number], {}>>((rangeItems, range) => {
    rangeItems[range] = {};
    return rangeItems;
  }, {});

  const [riskLevelsCountByAgeRange, setRiskLevelsCountByAgeRange] =
    useState<RiskLevelsCountByAgeRange>(initialState);

  const prevActiveFiltersRef = useRef<typeof activeFilters>();

  useEffect(() => {
    if (JSON.stringify(activeFilters) !== JSON.stringify(prevActiveFiltersRef.current)) {
      void onReload();
      const fetchData = async () => {
        for (const range of ageRanges) {
          const { riskLevelCounts } = await fetchRangeData(range);
          setRiskLevelsCountByAgeRange(prev => ({
            ...prev,
            [range]: { ...riskLevelCounts },
          }));
        }
        onLoad();
      };

      void fetchData();
      prevActiveFiltersRef.current = activeFilters;
    }
  }, [activeFilters]);

  return [riskLevelsCountByAgeRange, setRiskLevelsCountByAgeRange];
};
