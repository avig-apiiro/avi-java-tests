import { observer } from 'mobx-react';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { VendorCircle } from '@src-v2/components/circles';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { StickyHeader } from '@src-v2/components/layout/sticky-header';
import { Size } from '@src-v2/components/types/enums/size';
import { ServerDependencies } from '@src-v2/containers/pages/pipelines/cicd-servers/server-dependencies';
import { ServerPipelines } from '@src-v2/containers/pages/pipelines/cicd-servers/server-pipelines';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';

export default observer(() => {
  const { pipelines, rbac } = useInject();
  const { cicdServerKey } = useParams<{ cicdServerKey: string }>();
  const cicdServer = useSuspense(pipelines.getCICDServer, {
    key: cicdServerKey,
  });
  const { path: basePath, url: baseUrl } = useRouteMatch();

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <Page title={cicdServer.serverUrl}>
      <StickyHeader
        title={
          <TitleWrapper>
            <VendorCircle name={cicdServer.cicdTechnology} size={Size.XXLARGE} />
            {cicdServer.serverUrl}
          </TitleWrapper>
        }
        navigation={[
          {
            label: `Pipelines (${cicdServer.pipelinesCount})`,
            to: 'pipelines',
          },
          { label: `Dependencies (${cicdServer.dependenciesCount})`, to: 'dependencies' },
        ].filter(Boolean)}
      />

      <Switch>
        <Route path={`${basePath}/pipelines`}>
          <Gutters>
            <ServerPipelines serverUrl={cicdServer.serverUrl} />
          </Gutters>
        </Route>
        <Route path={`${basePath}/dependencies`}>
          <Gutters>
            <ServerDependencies serverUrl={cicdServer.serverUrl} />
          </Gutters>
        </Route>

        <Redirect to={`${baseUrl}/pipelines`} />
      </Switch>
    </Page>
  );
});

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
