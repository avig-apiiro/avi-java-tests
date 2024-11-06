import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Link, SubHeading4 } from '@src-v2/components/typography';
import { PlainRelatedFindingsCard } from '@src-v2/containers/pages/artifacts/artifact-pane/related-finding/plain-related-findings-card';
import { relatedFindingsInCodeRepositoryTableColumns } from '@src-v2/containers/pages/artifacts/artifact-pane/related-finding/table-columns';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';
import { useInject, useSuspense } from '@src-v2/hooks';
import { RelatedFindingCodeRepository } from '@src-v2/types/artifacts/artifacts-types';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { AssociatedObject } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const RelatedFindingsInCodeRepositoryCards = ({
  associatedObject,
  ...props
}: {
  associatedObject: AssociatedObject;
} & ControlledCardProps) => {
  const { artifacts } = useInject();
  const { finding: findingObj } = useArtifactPaneContext();

  const artifactRelatedCodeRepositoryFindings = useSuspense(
    artifacts.getArtifactRelatedCodeRepositoryFindings,
    {
      key: associatedObject?.identifier,
      dependencyName: findingObj.finding.packageName,
    }
  );

  return (
    <>
      {artifactRelatedCodeRepositoryFindings?.map(artifactRelatedCodeRepositoryFinding => (
        <PlainRelatedFindingsCard
          title={
            <CodeRepositoryTitle
              artifactRelatedCodeRepositoryFinding={artifactRelatedCodeRepositoryFinding}
            />
          }
          subTitle={
            <RelatedFindingsSubTitle>
              <span>
                Additional {findingObj.finding.packageName} vulnerabilities introduced through
              </span>
              <CodeReferenceLink
                codeReference={artifactRelatedCodeRepositoryFinding.codeReference}
                repository={{
                  url: artifactRelatedCodeRepositoryFinding.url,
                  vendor: artifactRelatedCodeRepositoryFinding.provider,
                  referenceName: artifactRelatedCodeRepositoryFinding.referenceName,
                }}
              />
            </RelatedFindingsSubTitle>
          }
          relatedFindingData={artifactRelatedCodeRepositoryFinding.dependencyFindings}
          tableColumns={relatedFindingsInCodeRepositoryTableColumns}
          codeOwner={artifactRelatedCodeRepositoryFinding.codeOwner}
          {...props}
        />
      ))}
    </>
  );
};

const CodeRepositoryTitle = ({
  artifactRelatedCodeRepositoryFinding,
}: {
  artifactRelatedCodeRepositoryFinding: RelatedFindingCodeRepository;
}) => {
  const {
    referenceName,
    provider,
    repositoryKey,
    repositoryName,
    dependencyFindings,
    repositoryBusinessImpact,
    repositoryIsActive,
  } = artifactRelatedCodeRepositoryFinding;
  return (
    <TitleWrapper>
      Related findings in code repository
      <>{dependencyFindings?.length > 0 && ` (${dependencyFindings.length})`}</>
      <VendorIcon name={provider} size={Size.XSMALL} />
      <Link to={`/profiles/repositories/${repositoryKey}`} onClick={stopPropagation}>
        {repositoryName} ({referenceName})
      </Link>
      {repositoryBusinessImpact && (
        <BusinessImpactIndicator
          businessImpact={BusinessImpact[repositoryBusinessImpact.toLowerCase()]}
          size={Size.XXSMALL}
        />
      )}
      <ActivityIndicator active={repositoryIsActive} />
    </TitleWrapper>
  );
};

const TitleWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const RelatedFindingsSubTitle = styled(SubHeading4)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 4rem;

  ${CodeReferenceLink} {
    width: fit-content;
  }

  span {
    flex-shrink: 0;
  }
`;
