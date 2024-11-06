import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { AboutArtifactReferenceCard } from '@src-v2/containers/pages/artifacts/artifact-reference-pane/about-artifact-reference-card';

export const ArtifactReferencePaneContent = (props: ControlledCardProps) => {
  return (
    <>
      <AboutArtifactReferenceCard {...props} />
    </>
  );
};
