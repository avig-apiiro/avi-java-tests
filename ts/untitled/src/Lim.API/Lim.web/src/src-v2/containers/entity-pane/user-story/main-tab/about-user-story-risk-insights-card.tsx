import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { Feedback } from '@src-v2/components/feedback';
import { useUserStoryPaneContext } from '@src-v2/containers/entity-pane/user-story/use-user-story-pane-context';
import { humanize } from '@src-v2/utils/string-utils';

export function AboutUserStoryRiskInsightsCard(props: ControlledCardProps) {
  const { element, risk } = useUserStoryPaneContext();
  const feedbackContext = {
    dependencyDataModelReference: risk.primaryDataModelReference,
    dependencyFindingId: element.key,
    fieldName: 'reasoning',
  };

  return (
    <ControlledCard
      {...props}
      title="Risk insights"
      footer={<Feedback context={feedbackContext} poweredBy="Powered by ApiiroAI" />}>
      <EvidenceLinesWrapper>
        {element?.issueRiskPrediction?.category && (
          <EvidenceLine isExtendedWidth label="Risk type">
            {humanize(element.issueRiskPrediction.category)}
          </EvidenceLine>
        )}
        {element?.issueRiskPrediction?.reasoning && (
          <EvidenceLine isExtendedWidth label="Risk summary">
            {element.issueRiskPrediction.reasoning}
          </EvidenceLine>
        )}
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}
