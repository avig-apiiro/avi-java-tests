import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ArtifactsDependencies } from '@src-v2/containers/pages/artifacts/artifacts-dependencies';
import { ArtifactsVersions } from '@src-v2/containers/pages/artifacts/artifacts-versions';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';

export const ArtifactsInventoryView = () => {
  const { artifacts, rbac } = useInject();
  const { path: basePath, url: baseUrl } = useRouteMatch();
  const { artifactKey } = useParams<{ artifactKey: string }>();
  const artifact = useSuspense(artifacts.getArtifact, { key: artifactKey });

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <AsyncBoundary>
      <ArtifactsInventoryViewContainer>
        <Tabs
          tabs={[
            {
              key: 'dependencies',
              label: `Dependencies (${artifact.dependenciesCount})`,
              to: 'dependencies',
            },
            {
              key: 'versions',
              label: `Versions (${artifact.versionsCount})`,
              to: 'versions',
            },
          ]}
          variant={Variant.SECONDARY}
        />
        <Switch>
          <Route path={`${basePath}/dependencies`}>
            <ArtifactsDependencies />
          </Route>
          <Route path={`${basePath}/versions`}>
            <ArtifactsVersions />
          </Route>
          <Redirect to={`${baseUrl}/dependencies`} />
        </Switch>
      </ArtifactsInventoryViewContainer>
    </AsyncBoundary>
  );
};

const ArtifactsInventoryViewContainer = styled.div`
  margin-top: 4rem;
`;
