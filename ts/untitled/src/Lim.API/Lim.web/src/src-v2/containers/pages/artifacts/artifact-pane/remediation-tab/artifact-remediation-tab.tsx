import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ArtifactRemediationSuggestionCard } from '@src-v2/containers/pages/artifacts/artifact-pane/remediation-tab/artifact-remediation-suggestion-card';

export const ArtifactRemediationTab = (props: ControlledCardProps) => (
  <ArtifactRemediationSuggestionCard {...props} />
);
