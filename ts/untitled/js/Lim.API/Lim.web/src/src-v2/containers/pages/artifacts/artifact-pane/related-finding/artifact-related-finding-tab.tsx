import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { RelatedFindingsInCodeRepositoryCards } from '@src-v2/containers/pages/artifacts/artifact-pane/related-finding/related-findings-in-code-repository-cards';
import { RelatedFindingsInContainerCard } from '@src-v2/containers/pages/artifacts/artifact-pane/related-finding/related-findings-in-container-card';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';

export const ArtifactRelatedFindingTab = (props: ControlledCardProps) => {
  const { finding: findingObj } = useArtifactPaneContext();
  const associatedObject = findingObj?.associatedObjects.find(
    associatedObject => associatedObject.associatedObjectRole === 'Subject'
  );

  return (
    <>
      {associatedObject && (
        <>
          <RelatedFindingsInContainerCard associatedObject={associatedObject} {...props} />
          <RelatedFindingsInCodeRepositoryCards associatedObject={associatedObject} {...props} />
        </>
      )}
    </>
  );
};
