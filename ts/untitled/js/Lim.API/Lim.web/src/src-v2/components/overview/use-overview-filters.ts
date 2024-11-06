import { useRouteMatch } from 'react-router-dom';
import { ActiveFilterData, ActiveFiltersData, useFilters } from '@src-v2/hooks/use-filters';

type OverviewFilters = Partial<{
  DashboardDateRange: ActiveFilterData;
  ApplicationGroupKeys: ActiveFilterData;
  AssetCollectionKeys: ActiveFilterData;
  RepositoryKeys: ActiveFilterData;
  OrgTeam: ActiveFilterData;
}> &
  ActiveFiltersData;

export function useOverviewFilters() {
  const { activeFilters, ...filtersProps } = useFilters();
  const { params } =
    useRouteMatch<{ profileType: string; profileKey: string }>(
      '/profiles/:profileType/:profileKey'
    ) ?? {};

  const filters: OverviewFilters = activeFilters ?? {
    searchTerm: null,
    group: null,
    operator: null,
  };

  if (params?.profileType === 'applications') {
    filters.AssetCollectionKeys = { values: [params.profileKey] };
  }

  if (params?.profileType === 'teams') {
    filters.OrgTeam = { values: [...(filters.OrgTeam?.values ?? [params.profileKey])] };
  }

  if (params?.profileType === 'repositories') {
    filters.RepositoryKeys = { values: [params.profileKey] };
  }

  return { filtersProps, activeFilters: filters };
}
