import { CollapsibleCardsController } from '@src-v2/components/cards/collapsbile-cards-controller';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ExpandableDescription } from '@src-v2/containers/entity-pane/sast/expandable-description';
import { useUserStoryPaneContext } from '@src-v2/containers/entity-pane/user-story/use-user-story-pane-context';
import { Feedback } from '@src/src-v2/components/feedback';

export const UserStoryRemediationTab = () => {
  const { element } = useUserStoryPaneContext();
  return (
    <CollapsibleCardsController>
      {props => (
        <>
          {element?.issueRiskPrediction?.securityReviewQuestions && (
            <SecurityReviewQuestionsCard {...props} />
          )}
          {element?.issueRiskPrediction?.threatModel && <ThreatModelingStories {...props} />}
        </>
      )}
    </CollapsibleCardsController>
  );
};

const SecurityReviewQuestionsCard = (props: ControlledCardProps) => {
  const { element, risk } = useUserStoryPaneContext();
  const feedbackContext = {
    dependencyDataModelReference: risk.primaryDataModelReference,
    dependencyFindingId: element.key,
    fieldName: 'securityReviewQuestions',
  };

  return (
    <ControlledCard
      {...props}
      title="Security review questions"
      footer={<Feedback context={feedbackContext} poweredBy="Powered by ApiiroAI" />}>
      <ExpandableDescription maxPreviewChars={800}>
        {element.issueRiskPrediction.securityReviewQuestions}
      </ExpandableDescription>
    </ControlledCard>
  );
};

const ThreatModelingStories = (props: ControlledCardProps) => {
  const { element, risk } = useUserStoryPaneContext();
  const feedbackContext = {
    dependencyDataModelReference: risk.primaryDataModelReference,
    dependencyFindingId: element.key,
    fieldName: 'threatModel',
  };

  return (
    <ControlledCard
      {...props}
      title="Threat modeling stories"
      footer={<Feedback context={feedbackContext} poweredBy="Powered by ApiiroAI" />}>
      <ExpandableDescription maxPreviewChars={800}>
        {element.issueRiskPrediction.threatModel}
      </ExpandableDescription>
    </ControlledCard>
  );
};
