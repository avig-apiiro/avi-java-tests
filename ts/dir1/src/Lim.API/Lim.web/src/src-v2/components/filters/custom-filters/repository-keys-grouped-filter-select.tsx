import { useCallback } from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  RemoteGroupedFilterSelect,
  RemoteGroupedFilterSelectProps,
} from '@src-v2/components/filters/inline-control/components/remote-grouped-filter-select';
import { useInject } from '@src-v2/hooks';

export function RepositoryKeysGroupedFilterSelect(
  props: Omit<RemoteGroupedFilterSelectProps, 'searchMethod' | 'initSelectedOptions'>
) {
  const { params } =
    useRouteMatch<{ profileType: string; profileKey: string }>(
      '/profiles/:profileType/:profileKey'
    ) ?? {};

  const { overview } = useInject();

  const fetchRepositories = useCallback(
    ({ searchTerm }: { searchTerm: string }) =>
      overview.searchRepositories({
        searchTerm,
        assetCollectionKey: ['teams', 'applications'].includes(params?.profileType)
          ? params.profileKey
          : undefined,
      }),
    [params, overview]
  );

  return (
    <RemoteGroupedFilterSelect
      {...props}
      initSelectedOptions={overview.initRepositoriesFilterOptions}
      searchMethod={fetchRepositories}
    />
  );
}
