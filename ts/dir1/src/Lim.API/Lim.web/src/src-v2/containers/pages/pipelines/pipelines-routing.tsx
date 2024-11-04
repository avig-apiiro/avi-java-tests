import { observer } from 'mobx-react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { StickyHeader } from '@src-v2/components/layout';
import CICDPipelinesPage from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipelines-page';
import CICDServersPage from '@src-v2/containers/pages/pipelines/cicd-servers/cicd-servers-page';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';

export default observer(() => {
  const { rbac } = useInject();
  const { path: basePath, url: baseUrl } = useRouteMatch();

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <StickyHeader
        navigation={[
          {
            label: 'Pipelines',
            to: 'cicd-pipelines',
          },
          { label: 'CI/CD servers', to: 'cicd-servers' },
        ]}
      />
      <Switch>
        <Route path={`${basePath}/cicd-pipelines`}>
          <CICDPipelinesPage />
        </Route>
        <Route path={`${basePath}/cicd-servers`}>
          <CICDServersPage />
        </Route>

        <Redirect to={`${baseUrl}/cicd-pipelines`} />
      </Switch>
    </>
  );
});
