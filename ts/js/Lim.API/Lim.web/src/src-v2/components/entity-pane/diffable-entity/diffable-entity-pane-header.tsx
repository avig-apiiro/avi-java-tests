import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { ProfileRelatedPaneHeader } from '@src-v2/components/entity-pane/common/profile-related-pane-header';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { SvgIcon } from '@src-v2/components/icons';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { EllipsisText, Title } from '@src-v2/components/typography';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { useInject, useSuspense } from '@src-v2/hooks';
import { openShowOnClusterMap } from '@src/cluster-map-work/containers/panes/ShowOnClusterClusterMap';

export function DiffableEntityPaneHeader({ title }: { title?: ReactNode }) {
  const paneState = usePaneState();
  const { clusters } = useInject();
  const { element, relatedProfile, applications, orgTeams } = useEntityPaneContext();
  const clusterConnections = useSuspense(clusters.getClusterConnection, {
    repositoryAndModuleReferences: element.repositoryAndModuleReferences,
  }).flatMap(({ nodeLinks }) => nodeLinks ?? []);

  const handleShowOnCluster = useCallback(() => {
    openShowOnClusterMap(
      {
        annotatedRepositoryAndModuleReferences: [element],
        title: element.displayName,
      },
      paneState
    );
    paneState.closePane();
  }, [element, paneState.closePane]);

  return (
    <ProfileRelatedPaneHeader
      repositoryProfile={relatedProfile}
      applications={applications}
      orgTeams={orgTeams}>
      <EllipsisText>{title ?? <Title>{element.displayName}</Title>}</EllipsisText>

      {Boolean(clusterConnections?.length) && (
        <ShowOnClusterButton onClick={handleShowOnCluster} variant={Variant.TERTIARY}>
          <SvgIcon name="Cluster" />
          Show on cluster
        </ShowOnClusterButton>
      )}
      {element.codeReference && (
        <Button
          startIcon="Code"
          href={generateCodeReferenceUrl(relatedProfile, element.codeReference)}
          variant={Variant.SECONDARY}>
          View code
        </Button>
      )}
    </ProfileRelatedPaneHeader>
  );
}

const ShowOnClusterButton = styled(Button)`
  margin: 0 3rem 0 2rem;
`;
