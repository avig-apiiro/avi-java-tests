import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { Redirect, Switch, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Page } from '@src-v2/components/layout/page';
import { ProtectedRoute as Route } from '@src-v2/components/protected-route';
import { SubNavigationMenu } from '@src-v2/components/sub-navigation-menu';
import { AccessTokenForm } from '@src-v2/containers/access-tokens/access-token-form';
import { AccessTokensDisplayPanel } from '@src-v2/containers/access-tokens/access-tokens-display-panel';
import { MonitorDesignRisksPage } from '@src-v2/containers/pages/general-settings/monitor-design-risks-page';
import { RiskScorePage } from '@src-v2/containers/pages/general-settings/risk-score-page';
import { ScaPreferencesPage } from '@src-v2/containers/pages/general-settings/sca-preferences-page';
import { SlaSettingsPage } from '@src-v2/containers/pages/general-settings/sla-settings-page';
import { ProcessTagsPage } from '@src-v2/containers/process-tags/process-tags-page';
import { RolesForm } from '@src-v2/containers/roles/role-form';
import { RolesPage } from '@src-v2/containers/roles/roles-page';
import { UserGroupCreatePageNewLayout } from '@src-v2/containers/user-groups/user-groups-create-page-new-layout';
import { UserGroupsForm } from '@src-v2/containers/user-groups/user-groups-form';
import { UserGroupsPage } from '@src-v2/containers/user-groups/user-groups-page';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import RolesPageOld from '@src/blocks/RolesPage';
import ioc from '../../ioc';

export const getSettingsNavigationOptions = () => [
  {
    key: 'general',
    label: 'GENERAL',
    items: [
      {
        key: 'sla',
        label: 'SLA',
        route: '/settings/sla',
        hidden: !ioc.rbac.canEdit(resourceTypes.Global),
      },
      {
        key: 'risk-score',
        label: 'Risk score',
        route: '/settings/risk-score',
        hidden:
          !ioc.application.isFeatureEnabled(FeatureFlag.RiskScore) ||
          !ioc.rbac.canEdit(resourceTypes.Global),
      },
      {
        key: 'sca-configuration',
        label: 'SCA preferences',
        route: '/settings/sca-configuration',
        hidden:
          !ioc.application.isFeatureEnabled(FeatureFlag.ScaProviderOrder) ||
          !ioc.rbac.canEdit(resourceTypes.Global),
      },
      {
        key: 'monitor-design-risks',
        label: 'Monitor design risks',
        route: '/settings/monitor-design-risks',
        hidden: !ioc.rbac.canEdit(resourceTypes.Global),
      },
    ],
  },
  {
    key: 'access-permissions',
    label: 'ACCESS PERMISSIONS',
    items: [
      {
        key: 'roles',
        label: 'Roles & permissions',
        route: '/settings/access-permissions/roles',
        hidden:
          !ioc.application.configuration.supportsUserClaims ||
          (!ioc.rbac.canEdit(resourceTypes.Global) && !ioc.rbac.canEdit(resourceTypes.Roles)),
      },
      {
        key: 'user-groups',
        label: 'User groups',
        route: '/settings/access-permissions/user-groups',
        hidden: !ioc.application.configuration.supportsUserClaims,
      },
      {
        key: 'tokens',
        label: 'Access tokens',
        route: '/settings/access-permissions/tokens',
        hidden:
          !ioc.rbac.canEdit(resourceTypes.AccessTokens) && !ioc.rbac.canEdit(resourceTypes.Global),
      },
    ],
  },
];

export default observer(() => {
  const { accessTokens } = useInject();
  const { pathname } = useLocation();

  const navigationOptions = getSettingsNavigationOptions();
  const flatFilteredNavigationOptions = navigationOptions
    .flatMap(item => item.items)
    .filter(item => !item.hidden);

  const [selectedOption, setSelectedOption] = useState(
    flatFilteredNavigationOptions.find(item => pathname.includes(item.key))
  );

  useEffect(() => {
    setSelectedOption(flatFilteredNavigationOptions.find(item => pathname.includes(item.key)));
  }, [pathname]);

  const pathnameSplit = pathname.split('/');

  const hasSettingsAccess = flatFilteredNavigationOptions.length > 0;

  if (!hasSettingsAccess) {
    return <Redirect to="/" />;
  }

  const pathnameIncludesRoute = flatFilteredNavigationOptions.some(item =>
    pathname.includes(item.route)
  );
  const [firstVisibleItem] = flatFilteredNavigationOptions;

  if (firstVisibleItem.route !== pathname && !pathnameIncludesRoute) {
    return <Redirect to={firstVisibleItem.route} />;
  }

  return (
    <GridContainer>
      {!['create', 'edit'].includes(pathnameSplit[pathnameSplit.length - 1]) && (
        <SubNavigationMenu
          options={navigationOptions}
          currentOption={selectedOption}
          isGroupedOptions
        />
      )}
      <ContentContainer>
        <AsyncBoundary>
          <Switch>
            {ioc.application.isFeatureEnabled(FeatureFlag.RolesPageV2) && (
              <Route
                path={[
                  '/settings/access-permissions/roles/create',
                  '/settings/access-permissions/roles/:key/edit',
                ]}
                component={RolesForm}
              />
            )}
            <Route
              path="/settings/access-permissions/roles"
              component={
                ioc.application.isFeatureEnabled(FeatureFlag.RolesPageV2) ? RolesPage : RolesPageOld
              }
              exact
            />

            <Route
              path="/settings/access-permissions/tokens"
              component={() => (
                <Page title="Access Tokens">
                  <Switch>
                    <Route
                      path="/settings/access-permissions/tokens/create"
                      component={() => (
                        <AccessTokenForm
                          title="New Access Token"
                          dataFetcher={accessTokens.createAccessToken}
                        />
                      )}
                    />
                    <Route
                      path="/settings/access-permissions/tokens/:key/edit"
                      component={() => (
                        <AccessTokenForm
                          title="View & edit token"
                          dataFetcher={accessTokens.getAccessToken}
                        />
                      )}
                    />
                    <Route
                      path="/settings/access-permissions/tokens"
                      component={() => <AccessTokensDisplayPanel />}
                    />
                  </Switch>
                </Page>
              )}
            />
            <Route
              path="/settings/access-permissions/process-tags"
              component={() => <ProcessTagsPage />}
            />
            <Route
              path={[
                '/settings/access-permissions/user-groups/create',
                '/settings/access-permissions/user-groups/:key/edit',
              ]}
              component={() => (
                <UserGroupsForm>
                  <UserGroupCreatePageNewLayout />
                </UserGroupsForm>
              )}
            />
            <Route
              path="/settings/access-permissions/user-groups"
              component={() => <UserGroupsPage />}
            />
            <Route path="/settings/sla" component={() => <SlaSettingsPage />} />
            <Route path="/settings/risk-score" component={() => <RiskScorePage />} />
            <Route path="/settings/sca-configuration" component={() => <ScaPreferencesPage />} />
            <Route
              path="/settings/monitor-design-risks"
              component={() => <MonitorDesignRisksPage />}
            />
            <Redirect to="/settings" />
          </Switch>
        </AsyncBoundary>
      </ContentContainer>
    </GridContainer>
  );
});

const GridContainer = styled.div`
  width: 100%;
  display: flex;
  position: relative;

  ${SubNavigationMenu} {
    width: 54rem;
    min-width: 54rem;
    margin: 6rem 0 0 7rem;
  }

  ${FormLayoutV2.Footer} {
    position: absolute;
    bottom: 0;
    left: 0;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
`;
