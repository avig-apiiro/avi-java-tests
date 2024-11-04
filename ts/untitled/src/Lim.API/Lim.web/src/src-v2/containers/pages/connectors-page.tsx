import { Redirect, Route, Switch } from 'react-router-dom';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Page } from '@src-v2/components/layout/page';
import { ConnectorsCatalog } from '@src-v2/containers/connectors/connections/catalog/connectors-catalog';
import { ConnectorsLayout } from '@src-v2/containers/connectors/connectors-elements';
import { ConnectionManagement } from '@src-v2/containers/connectors/management/connection-management';
import { ConnectionSettingsPageRouting } from '@src-v2/containers/connectors/management/connection-settings-page-routing';
import { ManageConnections } from '@src-v2/containers/connectors/management/manage-connections';
import { RepositoriesManagement } from '@src-v2/containers/connectors/management/repositories-management';
import { ManageSingleConnection } from '@src-v2/containers/connectors/management/single-connection/manage-single-connection';
import { MultiBranchPage } from '@src-v2/containers/pages/multi-branch-page';

export default () => (
  <Switch>
    <Route
      path="/connectors/manage/server/:key/repositories/:providerRepositoryKey/multi-branch"
      exact>
      <MultiBranchPage />
    </Route>
    <Route
      path="/connectors/manage/server/:connectionUrl/settings"
      component={ConnectionSettingsPageRouting}
    />
    <Route path="/connectors/manage/server/:connectionUrl" component={ConnectionManagement} />
    <Route path="/connectors/manage/repositories" component={RepositoriesManagement} />
    <Route>
      <Page title="Connectors">
        <ConnectorsLayout>
          <AsyncBoundary>
            <Switch>
              <Route
                path={[
                  '/connectors/connect/:key/:subType',
                  '/connectors/connect/:key',
                  '/connectors/connect',
                ]}
                component={ConnectorsCatalog}
              />
              <Route path="/connectors/manage/:key" component={ManageSingleConnection} />
              <Route path="/connectors/manage" component={ManageConnections} />
              <Redirect to="/connectors/connect" />
            </Switch>
          </AsyncBoundary>
        </ConnectorsLayout>
      </Page>
    </Route>
  </Switch>
);
