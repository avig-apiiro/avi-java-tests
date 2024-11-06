import { useCallback, useState } from 'react';
import { useFormState } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { FormContext } from '@src-v2/components/forms';
import { FormActions } from '@src-v2/components/forms/form-actions';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Heading } from '@src-v2/components/typography';
import { ModalRouteChangePrompt } from '@src-v2/containers/modals/route-prompt-message-modal';
import {
  DetailsFormContainer,
  QuestionCard,
} from '@src-v2/containers/questionnaire/common-components';
import { useShareLinkModal } from '@src-v2/containers/questionnaire/hooks/use-share-link-modal';
import {
  InputControlQuestion,
  SelectInputQuestion,
} from '@src-v2/containers/questionnaire/questionnaire-input-factory';
import { useInject, useSuspense } from '@src-v2/hooks';
import { MultipleErrors } from '@src-v2/types/multipleErrors';
import { StubAny } from '@src-v2/types/stub-any';

function validateQuestionnaire(issueUrl: string, template: StubAny, title: string) {
  const validationErrors = [];
  if (!/^(http|https):\/\/[^ "]+$/.test(issueUrl)) {
    validationErrors.push('Issue URL must be a valid URL');
  }
  if (!template) {
    validationErrors.push('Template must be present');
  }
  if (!title) {
    validationErrors.push('Name must be present');
  }
  return validationErrors;
}

export const NewQuestionnaireForm = (props: StubAny) => {
  const history = useHistory();
  const { questionnaires, toaster } = useInject();
  const { templates } = useSuspense(questionnaires.getNewQuestionnaireOptions);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const onCloseModal = useCallback(() => {
    history.goBack();
  }, []);

  const { showShareModal, shareLinkModalElement } = useShareLinkModal({
    title: 'Success! Your questionnaire is now available',
    cancelText: 'Skip for now',
    onClose: onCloseModal,
  });

  const handleSubmit = useCallback(async (data: StubAny) => {
    const { template, title, issueUrl } = data;

    // TODO: delete this once "proper" form validation is implemented
    const validationErrors = validateQuestionnaire(issueUrl, template, title);
    if (validationErrors.length) {
      validationErrors.forEach(message => toaster.error(message));
      return;
    }

    // we currently only support links to jira tickets.
    // if we'd need to support anything else, probably need to do some parsing of the URL server-side
    const jiraIssueId = issueUrl.split('/').pop();
    const provider = 'Jira';

    try {
      const { id, accessKey } = await questionnaires.newQuestionnaire({
        templateId: template.value,
        title,
        triggeringIssueParams: {
          externalUrl: issueUrl,
          externalId: jiraIssueId,
          provider,
        },
      });
      setFormSubmitted(true);
      showShareModal(`/questionnaire-public/${id}?accessKey=${encodeURIComponent(accessKey)}`);
    } catch (err) {
      err instanceof MultipleErrors
        ? err.messages.forEach(m => toaster.error(m))
        : toaster.error(err.message);
    }
  }, []);

  return (
    <>
      <FormContext form={FormLayoutV2} onSubmit={handleSubmit} displayPromptOnLeave={false}>
        <FormLayoutV2.Container {...props}>
          <QuestionnaireDetailsSection templates={templates} />
        </FormLayoutV2.Container>
        <NewQuestionnaireFooter formSubmitted={formSubmitted} />
      </FormContext>
      {shareLinkModalElement}
    </>
  );
};

const NewQuestionnaireFooter = ({ formSubmitted }: { formSubmitted: StubAny }) => {
  const history = useHistory();
  const { isDirty } = useFormState();

  return (
    <>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <FormActions submitText="Create" onCancel={() => history.goBack()} />
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
      <ModalRouteChangePrompt title="Discard Changes?" when={isDirty && !formSubmitted}>
        There are unsaved changes that will be deleted.
        <br />
        Are you sure?
      </ModalRouteChangePrompt>
    </>
  );
};

const QuestionnaireDetailsSection = ({ templates, ...props }: { templates: StubAny }) => (
  <DetailsFormContainer {...props}>
    <Heading data-required>Questionnaire details</Heading>
    <QuestionCard required title="Template" description="Choose a template for this questionnaire">
      <SelectInputQuestion
        items={templates.map(({ id, title }: { id: string; title: string }) => ({
          value: id,
          label: title,
        }))}
        name="template"
        placeholder="Select a template"
      />
    </QuestionCard>
    <QuestionCard
      required
      title="Issue URL"
      description="Copy and paste the ticket URL of the ticket you would like to be related to this questionnaire">
      <InputControlQuestion name="issueUrl" placeholder="Insert here..." />
    </QuestionCard>
    <QuestionCard required title="Name" description="Choose a name for this questionnaire">
      <InputControlQuestion name="title" placeholder="Type here..." />
    </QuestionCard>
  </DetailsFormContainer>
);
