import { observer } from 'mobx-react';
import { useMemo } from 'react';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SearchFilterInput } from '@src-v2/components/forms/search-input';
import { ErrorLayout, Gutters } from '@src-v2/components/layout';
import { RolesPermissionsFirstTimeLayout } from '@src-v2/components/layout/first-time-layouts/roles-permissions-first-time-layout';
import { Page } from '@src-v2/components/layout/page';
import { ResultsCounter } from '@src-v2/components/persistent-search-state/persistent-search-filters';
import { TableControls } from '@src-v2/components/table/table-addons';
import { Size } from '@src-v2/components/types/enums/size';
import { RoleCard } from '@src-v2/containers/roles/role-card';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';
import { useFilters } from '@src-v2/hooks/use-filters';
import { RoleType } from '@src-v2/services';
import { StubAny } from '@src-v2/types/stub-any';

export const RolesPage = observer((props: StubAny[]) => {
  const { rbac, roles } = useInject();
  const { activeFilters } = useFilters();
  const rolesList: RoleType[] = useSuspense(roles.getRoles);

  const filteredReversedRoles = useMemo(
    () =>
      activeFilters.searchTerm?.length > 0
        ? [...rolesList]
            .filter((role: RoleType) =>
              role.name.toLowerCase().includes(activeFilters.searchTerm?.toLowerCase())
            )
            .reverse()
        : [...rolesList].reverse(),
    [rolesList, activeFilters.searchTerm]
  );

  return (
    <Page title="Roles">
      <AnalyticsLayer
        analyticsData={{
          [AnalyticsDataField.Context]: 'Role & Permissions',
        }}>
        <AsyncBoundary>
          {rolesList.length === 0 ? (
            <RolesPermissionsFirstTimeLayout />
          ) : (
            <Gutters {...props} data-bottom-spacing>
              <GovernancePageTableControls>
                <SearchFilterInput
                  defaultValue={activeFilters?.searchTerm ?? ''}
                  placeholder="Search by role name"
                />
                <GovernancePageTableEndControls>
                  <ResultsCounter
                    count={filteredReversedRoles?.length}
                    total={rolesList?.length}
                    itemName="roles"
                  />
                  <Button
                    to="/settings/access-permissions/roles/create"
                    disabled={!rbac.canEdit(resourceTypes.Roles)}
                    size={Size.LARGE}>
                    Create role
                  </Button>
                </GovernancePageTableEndControls>
              </GovernancePageTableControls>
              <RolesContainer>
                {filteredReversedRoles.length ? (
                  filteredReversedRoles.map((role: RoleType) => (
                    <RoleCard key={role.key} role={role} />
                  ))
                ) : (
                  <ErrorLayout.NoResults />
                )}
              </RolesContainer>
            </Gutters>
          )}
        </AsyncBoundary>
      </AnalyticsLayer>
    </Page>
  );
});

const RolesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${DropdownMenu} {
    justify-self: flex-end;
  }
`;

const GovernancePageTableControls = styled(TableControls)`
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const GovernancePageTableEndControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4rem;
`;
