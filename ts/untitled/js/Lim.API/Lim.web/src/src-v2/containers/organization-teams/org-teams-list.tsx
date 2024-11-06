import { useCallback, useState } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { OrgTeamFirstTimeLayout } from '@src-v2/components/layout/first-time-layouts/org-team-first-time-layout';
import { PersistentSearchFilters } from '@src-v2/components/persistent-search-state/persistent-search-filters';
import { PersistentSearchStateScroller } from '@src-v2/components/persistent-search-state/persistent-search-state-scroller';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { TeamCard } from '@src-v2/containers/organization-teams/team-card';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useQueryParams, useSuspense } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { usePersistentSearchState } from '@src-v2/hooks/use-search-state';
import { SearchState } from '@src-v2/models/search-state';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { OrganizationTeamProfileResponse } from '@src-v2/types/profiles/organization-team-profile-response';

export const OrgTeamsList = () => {
  const { rbac, orgTeamProfiles, application } = useInject();
  const { queryParams } = useQueryParams();
  const { activeFilters } = useFilters();
  const { searchTerm, operator, ...filters } = activeFilters;
  const [searchCounters, setSearchCounters] = useState({ count: null, total: null });

  const handleSearchStateChanged = useCallback(
    (searchState: SearchState<OrganizationTeamProfileResponse>) => {
      setSearchCounters({ count: searchState.count, total: searchState.total });
    },
    [setSearchCounters]
  );

  const [filterOptions, sortOptions] = useSuspense([
    orgTeamProfiles.getFilterOptions,
    orgTeamProfiles.getSortOptions,
  ]);

  const searchState = usePersistentSearchState(orgTeamProfiles.searchProfiles, {
    sort: queryParams.sort,
    searchTerm,
    operator,
    filters,
  });

  if (application.isFeatureEnabled(FeatureFlag.EmptyStates) && searchState?.total === 0) {
    return <OrgTeamFirstTimeLayout />;
  }

  const canEditOrAddTeam = rbac.hasGlobalScopeAccess && rbac.canEdit(resourceTypes.Teams);

  return (
    <>
      <PersistentSearchFilters
        itemTypeDisplayName="team"
        searchCounters={searchCounters}
        sortOptions={sortOptions}
        filterOptions={filterOptions}
        actions={
          <Tooltip
            content="Contact your admin to create an organizational team"
            disabled={canEditOrAddTeam}>
            <Button
              variant={Variant.PRIMARY}
              to="/profiles/teams/create"
              disabled={!canEditOrAddTeam}>
              Create team
            </Button>
          </Tooltip>
        }
      />
      <AsyncBoundary>
        <PersistentSearchStateScroller
          dataFetcher={orgTeamProfiles.searchProfiles}
          defaultSortOrder={sortOptions[0]?.key}
          onSearchStateChanged={handleSearchStateChanged}
          itemTypeDisplayName="teams"
          itemRender={TeamCard}
        />
      </AsyncBoundary>
    </>
  );
};
