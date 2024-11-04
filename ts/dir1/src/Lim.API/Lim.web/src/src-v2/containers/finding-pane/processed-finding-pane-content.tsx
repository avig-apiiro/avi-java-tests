import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { AboutProcessedFindingCard } from '@src-v2/containers/entity-pane/processed-finding/about-processed-finding-card';
import { useFindingContext } from '@src-v2/containers/finding-pane/finding-context-provider';
import { AboutAffectedAssetCard } from '@src-v2/containers/pages/artifacts/artifact-pane/evidence-tab/about-affected-asset-card';
import { AboutVulnerabilityCard } from '@src-v2/containers/pages/artifacts/artifact-pane/evidence-tab/about-vulnerability-card';

export const ProcessedFindingPaneContent = (props: ControlledCardProps) => {
  const { finding } = useFindingContext();
  const { associatedObjects } = finding;

  const associatedObjectWithArtifactKey = associatedObjects.filter(associatedObject =>
    Boolean(associatedObject.dataModelReference?.artifactMultiSourcedEntityKey)
  );

  return (
    <>
      <AboutProcessedFindingCard finding={finding} type="finding" {...props} />
      <AboutVulnerabilityCard
        {...props}
        relatedEntity={null}
        finding={finding.finding}
        artifactKey={
          associatedObjectWithArtifactKey[0]?.dataModelReference?.artifactMultiSourcedEntityKey
        }
      />
      <AboutAffectedAssetCard
        {...props}
        finding={finding.finding}
        artifactKey={
          associatedObjectWithArtifactKey[0]?.dataModelReference?.artifactMultiSourcedEntityKey
        }
      />
    </>
  );
};
