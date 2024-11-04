import { observer } from 'mobx-react';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { StickyHeader } from '@src-v2/components/layout/sticky-header';
import { InsightTag } from '@src-v2/components/tags';
import { Size } from '@src-v2/components/types/enums/size';
import { artifactRiskTableColumns } from '@src-v2/containers/pages/artifacts/artifact-risks-table-content';
import { ArtifactsConnectionsView } from '@src-v2/containers/pages/artifacts/artifacts-connections-view';
import { ArtifactsInventoryView } from '@src-v2/containers/pages/artifacts/artifacts-inventory-view';
import { ArtifactsRisksTable } from '@src-v2/containers/pages/artifacts/artifacts-risks-table';
import { RisksContext, TableRiskType } from '@src-v2/containers/risks/risks-context';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';

export default observer(() => {
  const { artifacts, artifactDependencyFindingsRisks, rbac } = useInject();
  const { artifactKey } = useParams<{ artifactKey: string }>();
  const artifact = useSuspense(artifacts.getArtifact, { key: artifactKey });
  const { path: basePath, url: baseUrl } = useRouteMatch();

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <Page title={artifact.packageId}>
      <StickyHeader
        title={
          <TitleWrapper>
            <Circle size={Size.XXLARGE}>
              <SvgIcon name="ContainerImage" size={Size.XXLARGE} />
            </Circle>
            {artifact.packageId}
            {artifact.insights.map(insight => (
              <InsightTag key={insight.badge} sentiment={insight.sentiment} insight={insight} />
            ))}
          </TitleWrapper>
        }
        navigation={[
          {
            key: 'risks',
            label: 'Risks',
            to: 'risks',
          },
          {
            key: 'inventory',
            label: 'Inventory',
            to: 'inventory',
          },
          {
            key: 'connections',
            label: `Connections (${artifact.matchedCodeEntitiesCount + artifact.matchedCloudToolsCount})`,
            to: 'connections',
          },
        ]}
      />

      <Switch>
        <Route path={`${basePath}/risks`}>
          <Gutters>
            <RisksContext
              risksService={artifactDependencyFindingsRisks}
              title="Artifact risks"
              tableColumns={artifactRiskTableColumns}
              tableRiskType={TableRiskType.ArtifactDependencyFindings}>
              <ArtifactsRisksTable />
            </RisksContext>
          </Gutters>
        </Route>
        <Route path={`${basePath}/inventory`}>
          <Gutters>
            <ArtifactsInventoryView />
          </Gutters>
        </Route>
        <Route path={`${basePath}/connections`}>
          <Gutters>
            <ArtifactsConnectionsView />
          </Gutters>
        </Route>
        <Redirect to={`${baseUrl}/risks`} />
      </Switch>
    </Page>
  );
});

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${Circle} {
    background-color: var(--color-white);
    border: 0.25rem solid var(--color-blue-gray-30);

    ${BaseIcon} {
      color: var(--color-blue-gray-50);
    }
  }
`;
