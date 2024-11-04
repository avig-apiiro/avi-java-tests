import { useCallback } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { RemoteGroupedFilterSelect } from '@src-v2/components/filters/inline-control/components/remote-grouped-filter-select';
import { transformProfileEndpointToProfileType } from '@src-v2/data/transformers';
import { useInject } from '@src-v2/hooks';

export function CodeModuleFilterSelect(props) {
  const routeMatch = useRouteMatch<{
    profileType: 'applications' | 'repositories';
    profileKey: string;
  }>('/profiles/:profileType/:profileKey');
  const { risks } = useInject();

  const fetchModules = useCallback(
    ({ searchTerm }: { searchTerm: string }) =>
      risks.searchModuleFilter({
        searchTerm: searchTerm ? searchTerm : null,
        profileType: transformProfileEndpointToProfileType(routeMatch?.params.profileType),
        profileKey: routeMatch?.params.profileKey,
      }),
    []
  );

  return (
    <RemoteGroupedFilterSelect
      initSelectedOptions={risks.initModulesFilterOptions}
      searchMethod={fetchModules}
      {...props}
    />
  );
}
