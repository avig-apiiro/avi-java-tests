import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { VendorIcon } from '@src-v2/components/icons';
import { useDependencyPipelinePaneContext } from '@src-v2/containers/entity-pane/pipeline-dependencies/pipeline-dependency-pane';

export function PipelineDependenciesMainTab(props: ControlledCardProps) {
  const { element, relatedProfile } = useDependencyPipelinePaneContext();

  return (
    <ControlledCard {...props} title="About this pipeline dependency">
      {element.version && <EvidenceLine label="Version">{element.version}</EvidenceLine>}
      {element.cicdPipelineEntityId && (
        <EvidenceLine label="Related pipeline">
          <VendorIcon name={element.ciCdIacFramework ?? element.dependencyType} />
          {element.cicdPipelineEntityId}
        </EvidenceLine>
      )}
      <EvidenceLine label="Declared in">
        <DeclarationLink codeReference={element.codeReference} relatedProfile={relatedProfile} />
      </EvidenceLine>
    </ControlledCard>
  );
}
const DeclarationLink = styled(({ codeReference, relatedProfile, ...props }) => {
  return (
    <CodeReferenceLink {...props} repository={relatedProfile} codeReference={codeReference}>
      <LineNumber>line: {codeReference.lineNumber}</LineNumber>
    </CodeReferenceLink>
  );
})`
  display: flex;
  gap: 1rem;
`;

const LineNumber = styled.span`
  white-space: nowrap;
`;
