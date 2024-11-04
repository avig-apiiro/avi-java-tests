import styled from 'styled-components';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { SubHeading4 } from '@src-v2/components/typography';
import { PlainRelatedFindingsCard } from '@src-v2/containers/pages/artifacts/artifact-pane/related-finding/plain-related-findings-card';
import { relatedFindingsInContainerImageTableColumns } from '@src-v2/containers/pages/artifacts/artifact-pane/related-finding/table-columns';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';
import { useInject, useSuspense } from '@src-v2/hooks';
import { AssociatedObject } from '@src-v2/types/inventory-elements/lightweight-finding-response';

export const RelatedFindingsInContainerCard = ({
  associatedObject,
  ...props
}: {
  associatedObject: AssociatedObject;
} & ControlledCardProps) => {
  const { artifacts } = useInject();
  const { finding: findingObj } = useArtifactPaneContext();

  const relatedFindingData = useSuspense(artifacts.getArtifactRelatedFindings, {
    key: associatedObject?.identifier,
    dependencyName: findingObj.finding.packageName,
    findingId: findingObj.finding.id,
  });

  return (
    <PlainRelatedFindingsCard
      title={
        <>
          Related findings in container image
          <>{relatedFindingData?.length > 0 && ` (${relatedFindingData.length})`}</>
        </>
      }
      subTitle={
        <RelatedFindingsSubTitle>
          Additional {findingObj.finding.packageName} vulnerabilities found in this container image
        </RelatedFindingsSubTitle>
      }
      relatedFindingData={relatedFindingData}
      tableColumns={relatedFindingsInContainerImageTableColumns}
      {...props}
    />
  );
};
const RelatedFindingsSubTitle = styled(SubHeading4)`
  margin-bottom: 4rem;
`;
