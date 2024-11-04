import styled from 'styled-components';
import { VendorCircle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';
import { Artifact } from '@src-v2/types/artifacts/artifacts-types';

export const ArtifactCloudToolBannerTooltip = ({ artifact }: { artifact: Artifact }) => (
  <ArtifactCloudToolBannerTooltipContent>
    <ArtifactCloudToolBannerTooltipRow>
      Sources: <ArtifactSourceCloudToolWidget artifact={artifact} />
    </ArtifactCloudToolBannerTooltipRow>
    <ArtifactCloudToolBannerTooltipRow>
      Artifact registry: {artifact.artifactRegistriesProvider}
    </ArtifactCloudToolBannerTooltipRow>
    {/*<ArtifactCloudToolBannerTooltipRow>Artifact repository: </ArtifactCloudToolBannerTooltipRow>*/}
    <ArtifactCloudToolBannerTooltipRow>
      Number of versions: {artifact.versionsCount}
    </ArtifactCloudToolBannerTooltipRow>
  </ArtifactCloudToolBannerTooltipContent>
);

const ArtifactSourceCloudToolWidget = ({ artifact }: { artifact: Artifact }) => {
  const { sourcesProviders } = artifact;

  return (
    <ArtifactSourceCloudToolVendors>
      {sourcesProviders.map((sourcesProvider, index) => (
        <VendorCircle name={sourcesProvider} key={sourcesProvider + index} size={Size.XSMALL} />
      ))}
    </ArtifactSourceCloudToolVendors>
  );
};

const ArtifactCloudToolBannerTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ArtifactCloudToolBannerTooltipRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
`;

export const ArtifactSourceCloudToolVendors = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
