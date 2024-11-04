import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { AboutAffectedAssetCard } from '@src-v2/containers/pages/artifacts/artifact-pane/evidence-tab/about-affected-asset-card';
import { AboutArtifactCard } from '@src-v2/containers/pages/artifacts/artifact-pane/evidence-tab/about-artifact-card';
import { AboutVulnerabilityCard } from '@src-v2/containers/pages/artifacts/artifact-pane/evidence-tab/about-vulnerability-card';
import { MatchedSourceCodeCard } from '@src-v2/containers/pages/artifacts/artifact-pane/evidence-tab/matched-source-code-card';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export const ArtifactEvidenceTab = (props: ControlledCardProps) => {
  const { application } = useInject();
  const { risk, finding: findingObj } = useArtifactPaneContext();

  const artifactKey = findingObj.associatedObjects.find(
    associatedObject => associatedObject.type === 'Artifact'
  )?.identifier;

  return (
    <>
      <AboutArtifactCard {...props} />
      <AboutVulnerabilityCard
        {...props}
        finding={findingObj.finding}
        artifactKey={artifactKey}
        relatedEntity={risk?.relatedEntity}
      />
      <AboutAffectedAssetCard {...props} finding={findingObj.finding} artifactKey={artifactKey} />
      {application.isFeatureEnabled(FeatureFlag.ArtifactMatchedSourceCode) && artifactKey && (
        <MatchedSourceCodeCard {...props} artifactKey={artifactKey} />
      )}
    </>
  );
};
