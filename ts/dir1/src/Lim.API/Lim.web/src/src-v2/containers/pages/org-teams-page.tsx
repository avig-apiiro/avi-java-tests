import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { OrgTeamCreationForm } from '@src-v2/containers/organization-teams/org-team-creation-form';
import { OrgTeamsList } from '@src-v2/containers/organization-teams/org-teams-list';
import OrgTeamPage from '@src-v2/containers/pages/org-team-page';

export default () => {
  const { path: basePath } = useRouteMatch();

  return (
    <Switch>
      <Route path={[`${basePath}/create`, `${basePath}/:key/edit`]} exact>
        <OrgTeamFormPage />
      </Route>
      <Route path={`${basePath}/:key`}>
        <OrgTeamPage />
      </Route>
      <Route path={basePath} exact>
        <Page title="Teams">
          <AnalyticsLayer
            analyticsData={{
              [AnalyticsDataField.Context]: `Teams`,
            }}>
            <Gutters>
              <OrgTeamsList />
            </Gutters>
          </AnalyticsLayer>
        </Page>
      </Route>
    </Switch>
  );
};

function OrgTeamFormPage() {
  const { key } = useParams<{ key?: string }>();

  return (
    <Page title={`${key ? 'Edit' : 'Create'} team`}>
      <AnalyticsLayer
        analyticsData={{
          [AnalyticsDataField.Context]: `Teams`,
        }}>
        <OrgTeamCreationForm />
      </AnalyticsLayer>
    </Page>
  );
}
