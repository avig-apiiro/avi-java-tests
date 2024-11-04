import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ArtifactsCloudTools } from '@src-v2/containers/pages/artifacts/artifacts-cloud-tools';
import { ArtifactsCodeAssets } from '@src-v2/containers/pages/artifacts/artifacts-code-assets';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';

export const ArtifactsConnectionsView = () => {
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
              key: 'code-assets',
              label: `Code assets (${artifact.matchedCodeEntitiesCount})`,
              to: 'code-assets',
            },
            {
              key: 'cloud-tools',
              label: `Source assets (${artifact.matchedCloudToolsCount})`,
              to: 'cloud-tools',
            },
          ]}
          variant={Variant.SECONDARY}
        />
        <Switch>
          <Route path={`${basePath}/code-assets`}>
            <ArtifactsCodeAssets />
          </Route>
          <Route path={`${basePath}/cloud-tools`}>
            <ArtifactsCloudTools />
          </Route>
          <Redirect to={`${baseUrl}/code-assets`} />
        </Switch>
      </ArtifactsInventoryViewContainer>
    </AsyncBoundary>
  );
};

const ArtifactsInventoryViewContainer = styled.div`
  margin-top: 4rem;
`;
