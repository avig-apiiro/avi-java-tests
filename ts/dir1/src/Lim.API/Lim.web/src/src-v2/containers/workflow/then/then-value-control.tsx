import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { QuestionnaireTemplateSearchControl } from '@src-v2/containers/workflow/given/given-controls';
import { useAdditionalProperties } from '@src-v2/containers/workflow/hooks/use-additional-properties';
import {
  MessagingProviderControl,
  RepositoryProjectControl,
  ReviewerControl,
  SearchContributorsControl,
  TicketingProjectControl,
} from '@src-v2/containers/workflow/then/then-controls';
import { AdditionalProperty, GivenType, ThenType } from '@src-v2/containers/workflow/types/types';
import { workflowOptions as optionsType } from '@src-v2/containers/workflow/types/workflow-options';
import {
  WorkflowInputControl,
  WorkflowLabel,
} from '@src-v2/containers/workflow/workflow-editor-controls';

export const ThenValueControl = ({
  index,
  typeSettings,
  thenState,
}: {
  index: number;
  optionsSchema: typeof optionsType.then;
  typeSettings: { customSchema: boolean; messagingProvider: boolean; scmProvider: boolean };
  workflowType: GivenType;
  thenState: {
    type: ThenType;
    value: string;
    subType: string;
    index: number;
    additionalProperties: AdditionalProperty[];
  };
}) => {
  const { resetAdditionalProperties } = useAdditionalProperties(false, index);

  if (typeSettings.customSchema) {
    return (
      <>
        <WorkflowLabel>in</WorkflowLabel>
        <TicketingProjectControl data={{ index, ...thenState }} />
      </>
    );
  }

  switch (thenState.type) {
    case 'Slack':
    case 'GoogleChat':
    case 'Teams':
      return (
        <AsyncBoundary>
          <WorkflowLabel>on #</WorkflowLabel>
          <MessagingProviderControl
            creatable
            type={thenState.type}
            selectedItems={[]}
            name={`then[${index}].value`}
            onSelect={() => resetAdditionalProperties([])}
          />
        </AsyncBoundary>
      );
    case 'Github':
    case 'Gitlab':
      return (
        <AsyncBoundary>
          <WorkflowLabel>in</WorkflowLabel>
          <RepositoryProjectControl
            type={thenState.type}
            name={`then[${index}].value`}
            onSelect={() => resetAdditionalProperties([])}
          />
        </AsyncBoundary>
      );

    case 'AddTitleReviewer':
      return (
        <AsyncBoundary>
          <ReviewerControl
            name={`then[${index}].value`}
            onSelect={() => resetAdditionalProperties([])}
          />
        </AsyncBoundary>
      );

    case 'AddUserReviewer':
      return (
        <AsyncBoundary>
          <SearchContributorsControl name={`then[${index}].value`} />
        </AsyncBoundary>
      );

    case 'AddLabel':
      return (
        <AsyncBoundary>
          <WorkflowInputControl name={`then[${index}].value`} placeholder="Label value" />
        </AsyncBoundary>
      );

    case 'Webhook':
      return (
        <AsyncBoundary>
          <InputControl name={`then[${index}].value`} placeholder="Webhook URL" />
        </AsyncBoundary>
      );

    case 'Questionnaire':
      return (
        <>
          <WorkflowLabel>From Template</WorkflowLabel>
          <QuestionnaireTemplateSearchControl name={`then[${index}].value`} />
        </>
      );

    default:
      console.warn('Unknown then type', thenState.type);
      return null;
  }
};
