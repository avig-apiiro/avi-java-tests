import { observer } from 'mobx-react';
import { ReactNode, useCallback } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SvgIcon } from '@src-v2/components/icons';
import { Page } from '@src-v2/components/layout/page';
import { StickyHeader } from '@src-v2/components/layout/sticky-header';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { HeaderRiskDetails } from '@src-v2/components/risk/risk-details';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import {
  FlatLearningButton,
  LearningPane,
  LearningStatistics,
} from '@src-v2/containers/learning-stats';
import { PointsOfContact } from '@src-v2/containers/profiles/points-of-contact';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';

export default observer(
  ({ children, onEdit, onRemove }: { children: ReactNode; onEdit: StubAny; onRemove: StubAny }) => {
    const { application, rbac, applicationProfilesV2 } = useInject();
    const { key } = useParams<{ key?: string }>();
    const profile = useSuspense(applicationProfilesV2.getProfile, { key });

    const { pushPane } = usePaneState();

    const handleOpenPane = useCallback(() => {
      pushPane(
        <LearningPane>
          <LearningStatistics
            profileKey={key}
            dataFetcher={applicationProfilesV2.getLearningStatistics}
          />
        </LearningPane>
      );
    }, []);

    return (
      <Page title={profile.name}>
        <StickyHeader
          title={profile.name}
          description={profile.description}
          navigation={[
            { label: 'Profile', to: 'profile' },
            { label: 'Risk', to: 'risk' },
            { label: 'Timeline', to: 'timeline' },
            { label: 'Inventory', to: 'inventory' },
            application.isFeatureEnabled(FeatureFlag.SpacetimeGraph) && {
              label: 'Graph',
              to: 'graph',
            },
          ].filter(Boolean)}
          minimized={Boolean(useRouteMatch('/profiles/applications/:key/graph'))}>
          {profile.stillProcessing && <InfoTooltip content="Learning in progress" />}

          {!profile.isModuleBased && (
            <FlatLearningButton onClick={handleOpenPane}>Learning statistics</FlatLearningButton>
          )}

          {profile.pointsOfContact.length > 0 && (
            <PointsOfContact
              identities={profile.pointsOfContact}
              profileKey={key}
              isActive={profile.isActive}
            />
          )}

          <HeaderRiskDetails profile={profile} />

          {rbac.canEdit(resourceTypes.Products) && (
            <DropdownMenu data-name="profile-actions">
              <Dropdown.Item onClick={onEdit}>
                <SvgIcon name="Edit" /> Edit application
              </Dropdown.Item>
              <Dropdown.Item disabled={Boolean(profile.source)} onClick={onRemove}>
                <SvgIcon name="Trash" /> Delete application
              </Dropdown.Item>
            </DropdownMenu>
          )}
        </StickyHeader>
        {children}
      </Page>
    );
  }
);
