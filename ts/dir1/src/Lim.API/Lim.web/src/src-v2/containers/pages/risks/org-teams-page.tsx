import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { OrgTeamCreationForm } from '@src-v2/containers/organization-teams/org-team-creation-form';
import { OrgTeamsList } from '@src-v2/containers/organization-teams/org-teams-list';

export default () => {
  const { path: basePath } = useRouteMatch();

  return (
    <Page title="Teams">
      <AnalyticsLayer
        analyticsData={{
          [AnalyticsDataField.Context]: `Teams`,
        }}>
        <Gutters>
          <Switch>
            <Route path={`${basePath}/create`} exact>
              <OrgTeamCreationForm />
            </Route>
            <Route path={basePath} exact>
              <OrgTeamsList />
            </Route>
          </Switch>
        </Gutters>
      </AnalyticsLayer>
    </Page>
  );
};
