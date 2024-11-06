import { useCallback } from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  RemoteGroupedFilterSelect,
  RemoteGroupedFilterSelectProps,
} from '@src-v2/components/filters/inline-control/components/remote-grouped-filter-select';
import { useInject } from '@src-v2/hooks';

export function AssetCollectionKeysGroupedFilterSelect(
  props: Omit<RemoteGroupedFilterSelectProps, 'searchMethod' | 'initSelectedOptions'>
) {
  const { params } =
    useRouteMatch<{ profileType: string; profileKey: string }>('/profiles/teams/:profileKey') ?? {};

  const { overview } = useInject();

  const fetchApplications = useCallback(
    ({ searchTerm }: { searchTerm: string }) =>
      overview.searchApplications({
        searchTerm,
        orgTeamKey: params ? params.profileKey : undefined,
      }),
    [params, overview]
  );

  return (
    <RemoteGroupedFilterSelect
      {...props}
      initSelectedOptions={overview.initApplicationsFilterOptions}
      searchMethod={fetchApplications}
    />
  );
}
