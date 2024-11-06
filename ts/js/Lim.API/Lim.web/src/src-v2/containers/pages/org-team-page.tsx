import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SvgIcon } from '@src-v2/components/icons';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { StickyHeader } from '@src-v2/components/layout/sticky-header';
import { ProfilesProvider } from '@src-v2/components/profiles-inject-context';
import { TeamHeaderRiskDetails } from '@src-v2/containers/organization-teams/team-header';
import { TeamInventory } from '@src-v2/containers/organization-teams/team-inventory';
import { useDeleteTeamPrompt } from '@src-v2/containers/organization-teams/use-delete-team-prompt';
import { TeamOverview } from '@src-v2/containers/profiles/profile-overview';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { RisksTabSwitch } from '@src/blocks/RiskPosture/risks-tab-switch';
import TimelineInfiniteScroll from '@src/blocks/TimelineInfiniteScroll';

export default observer(() => {
  const [modalElement, onDelete] = useDeleteTeamPrompt();
  const { history, rbac, orgTeamProfiles } = useInject();
  const { key } = useParams<{ key: string }>();

  const profile = useSuspense(orgTeamProfiles.getProfile, { key });
  const { url: basePath } = useRouteMatch();
  const match = useRouteMatch('/profiles/teams/:key');

  const handleEdit = useCallback(() => {
    history.push(`${basePath}/edit`);
  }, [history, basePath]);

  const handleDelete = useCallback(() => {
    onDelete({ key, name: profile.name }, () => history.push('/profiles/teams'));
  }, [key, profile, onDelete]);

  return (
    <Page title={profile.name}>
      <StickyHeader
        title={profile.name}
        navigation={[
          { label: 'Profile', to: 'profile' },
          { label: 'Risk', to: 'risk' },
          { label: 'Timeline', to: 'timeline' },
          { label: 'Inventory', to: 'inventory' },
        ].filter(Boolean)}>
        <TeamHeaderRiskDetails profileKey={key} profile={profile} />
        {rbac.canEdit(resourceTypes.Teams) && (
          <DropdownMenu data-name="profile-actions">
            <Dropdown.Item onClick={handleEdit}>
              <SvgIcon name="Edit" /> Edit team
            </Dropdown.Item>
            <Dropdown.Item disabled={Boolean(profile.source)} onClick={handleDelete}>
              <SvgIcon name="Trash" /> Delete team
            </Dropdown.Item>
          </DropdownMenu>
        )}
      </StickyHeader>
      <ProfilesProvider value={orgTeamProfiles}>
        <Switch>
          <Route path={`${match.path}/profile`}>
            <TeamOverview />
          </Route>
          <Route path={`${match.path}/risk`}>
            <Gutters>
              <RisksTabSwitch profile={profile} profileType="OrgTeamProfile" />
            </Gutters>
          </Route>
          <Route path={`${match.path}/timeline`}>
            <Gutters>
              <TimelineInfiniteScroll entityKey={key} table="assetCollections" />
            </Gutters>
          </Route>
          <Route path={`${match.path}/inventory`}>
            <Gutters>
              <AsyncBoundary>
                <TeamInventory profile={profile} profileType={ProfileType.AssetCollection} />
              </AsyncBoundary>
            </Gutters>
          </Route>
          <Redirect to={`${basePath}/profile`} />
        </Switch>
      </ProfilesProvider>

      {modalElement}
    </Page>
  );
});
