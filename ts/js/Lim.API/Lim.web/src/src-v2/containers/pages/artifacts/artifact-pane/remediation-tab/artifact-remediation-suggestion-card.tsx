import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { VendorIcon } from '@src-v2/components/icons';
import { ArtifactRemediationSuggestionContent } from '@src-v2/containers/pages/artifacts/artifact-pane/remediation-tab/artifact-remediation-suggestion-content';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { Provider } from '@src-v2/types/enums/provider';

export const ArtifactRemediationSuggestionCard = (props: ControlledCardProps) => {
  const { finding } = useArtifactPaneContext();
  const {
    finding: { sourceProviders },
  } = finding;
  return (
    <ControlledCard
      {...props}
      title={
        <RemediationSuggestionCardContainer>
          Remediation suggestion by <VendorIcon name={sourceProviders?.[0]} />
          {getProviderDisplayName(sourceProviders[0] as Provider)}
        </RemediationSuggestionCardContainer>
      }
      triggerOpenState={{ isOpen: true }}>
      <ArtifactRemediationSuggestionContent />
    </ControlledCard>
  );
};

const RemediationSuggestionCardContainer = styled.div`
  display: flex;
  gap: 1rem;
`;
