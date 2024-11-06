import { Fragment } from 'react';
import styled from 'styled-components';
import { VendorCircle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';
import { EllipsisText } from '@src-v2/components/typography';
import { ArtifactAsset } from '@src-v2/types/artifacts/artifacts-types';

export const ArtifactCloudToolAssetTooltip = ({
  artifactAsset,
}: {
  artifactAsset: ArtifactAsset;
}) => (
  <AssetTooltip>
    {artifactAsset.artifactRepositoryName ? (
      <ArtifactRepositoryContent>
        <ArtifactAssetLabel>Artifact repository:</ArtifactAssetLabel>
        <VendorCircle size={Size.SMALL} name={artifactAsset.provider} />
        <EllipsisText>{artifactAsset.artifactRepositoryName}</EllipsisText>
      </ArtifactRepositoryContent>
    ) : artifactAsset.clusterNames ? (
      <ArtifactClusterContent>
        {artifactAsset.clusterNames.map((clusterName, index) => (
          <Fragment key={clusterName + index}>
            <ArtifactClusterContentRow>
              <ArtifactAssetLabel>Cluster:</ArtifactAssetLabel>
              <VendorCircle size={Size.SMALL} name={artifactAsset.provider} />{' '}
              <EllipsisText>{clusterName}</EllipsisText>
            </ArtifactClusterContentRow>
            {artifactAsset.accountIds[index] && (
              <ArtifactClusterContentRow>
                Account ID: {artifactAsset.accountIds[index]}
              </ArtifactClusterContentRow>
            )}
          </Fragment>
        ))}
      </ArtifactClusterContent>
    ) : null}
  </AssetTooltip>
);

const AssetTooltip = styled.div`
  display: flex;
`;

const ArtifactAssetLabel = styled.span`
  flex: 0 0 auto;
`;

const ArtifactClusterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const ArtifactClusterContentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ArtifactRepositoryContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
