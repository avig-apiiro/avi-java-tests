import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  HierarchyFilterGeneralSelect,
  HierarchyFilterGeneralSelectProps,
} from '@src-v2/components/filters/inline-control/containers/hierarchy-filter-general-select';
import { Filter, isHierarchyFilterOption } from '@src-v2/hooks/use-filters';

export function OrgTeamsFilterSelect({
  filter,
  ...props
}: Omit<HierarchyFilterGeneralSelectProps, 'noCascade'>) {
  const routeMatch = useRouteMatch<{
    profileType: 'teams';
    profileKey: string;
  }>('/profiles/:profileType/:profileKey');

  const updatedFilter = useMemo<Filter>(
    () =>
      routeMatch
        ? {
            ...filter,
            options: filter.options.filter(
              option =>
                isHierarchyFilterOption(option) &&
                option.hierarchy.some(hierarchy => hierarchy.key === routeMatch.params.profileKey)
            ),
          }
        : filter,
    [filter]
  );

  return updatedFilter.options?.length ? (
    <HierarchyFilterGeneralSelect {...props} noCascade filter={updatedFilter} />
  ) : null;
}
