import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { CardContentWrapper } from '@src-v2/containers/pages/artifacts/artifact-pane/components/common';
import { useArtifactReferenceContextProvider } from '@src-v2/containers/pages/artifacts/artifact-reference-pane/use-artifact-reference-pane-context';

export const AboutArtifactReferenceCard = (props: ControlledCardProps) => {
  const history = useHistory();
  const { artifact } = useArtifactReferenceContextProvider();

  return (
    <ControlledCard {...props} title="About this risk">
      <CardContentWrapper>
        <EvidenceLine isExtendedWidth label="Artifact profile">
          <IconWrapper name="ContainerImage" size={Size.XSMALL} />
          <ContainerImageButton
            underline={Boolean(artifact.key)}
            size={Size.XSMALL}
            onClick={() =>
              artifact.key ? history.push(`inventory/artifacts/${artifact.key}/risks`) : null
            }>
            {artifact.packageId}
          </ContainerImageButton>
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Type">
          {artifact.artifactTypeDisplayName}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Source">
          {artifact.sourcesProviders?.map((source: string) => <VendorIcon name={source} />)}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Number of versions">
          {artifact.versionsCount}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Number of matched code entities">
          {artifact.matchedCodeEntitiesCount}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Artifact repository">
          {artifact.artifactRepositoryName}
        </EvidenceLine>
      </CardContentWrapper>
    </ControlledCard>
  );
};

const ContainerImageButton = styled(TextButton)`
  cursor: ${props => (props.underline ? 'pointer' : 'default')};
`;

const IconWrapper = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;
