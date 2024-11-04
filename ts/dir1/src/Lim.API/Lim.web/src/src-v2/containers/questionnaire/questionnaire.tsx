import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { FormContext, Input } from '@src-v2/components/forms';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { Modal } from '@src-v2/components/modals';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading1 } from '@src-v2/components/typography';
import {
  Description,
  QuestionnaireContainer,
  QuestionnaireLayout,
} from '@src-v2/containers/questionnaire/common-components';
import { useDiscardQuestionnaireModal } from '@src-v2/containers/questionnaire/hooks/use-discard-questionnaire-modal';
import { useShareLinkModal } from '@src-v2/containers/questionnaire/hooks/use-share-link-modal';
import { QuestionnaireBody } from '@src-v2/containers/questionnaire/questionnaire-body';
import { QuestionnaireFormActions } from '@src-v2/containers/questionnaire/questionnaire-form-actions';
import { QuestionnaireHeader } from '@src-v2/containers/questionnaire/questionnaire-header';
import { useInject, useQueryParams, useSuspense, useValidation } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { Question, Status } from '@src-v2/types/queastionnaire/questionnaire-response';
import { StubAny } from '@src-v2/types/stub-any';

export const Questionnaire = ({ responseKey }: { responseKey: string }) => {
  const history = useHistory();
  const { questionnaires, toaster } = useInject();

  const {
    queryParams: { accessKey, admin: isAdminView },
  } = useQueryParams();

  const { metadata, response } = useSuspense(questionnaires.getQuestionnaire, {
    responseKey,
    accessKey,
    isAdminView: Boolean(isAdminView),
  });
  const { showShareModal, shareLinkModalElement } = useShareLinkModal({});
  const [submitModalElement, setSubmitModal, closeSubmitModal] = useModalState();
  const [formSubmitted, setFormSubmitted] = useState(false);

  function goToSummaryPage() {
    history.push(
      `/questionnaire-public/summary/${responseKey}?accessKey=${encodeURIComponent(
        accessKey.toString()
      )}`
    );
  }

  const handleSubmit = useCallback(
    (questionnaireData: StubAny) => {
      const submitQuestionnaire = async (respondentData: StubAny) => {
        try {
          setFormSubmitted(true);
          await questionnaires.submitResponse(
            responseKey,
            metadata.accessKey,
            respondentData,
            questionnaireData
          );
          goToSummaryPage();
          closeSubmitModal();
        } catch (err) {
          toaster.error(err.response.status === 400 ? err.response.data : 'Something went wrong');
        }
      };

      setSubmitModal(
        <SubmitModal closeSubmitModal={closeSubmitModal} handleSubmit={submitQuestionnaire} />
      );
    },
    [responseKey]
  );

  const getAnswer = (question: Question) => {
    if (!question.answer) {
      return null;
    }
    return question.type === 'singleselect' ? question.answer[0] : question.answer;
  };

  const initialAnswers = response.sections.flatMap(section =>
    section.questions.map(question => [question.id, getAnswer(question)])
  );
  const defaultValues = Object.fromEntries(initialAnswers);

  const [discardModalElement, onDiscardClick] = useDiscardQuestionnaireModal(responseKey);

  const canBeAnswered = response.currentState.status !== Status.Discarded;
  if (!isAdminView && !canBeAnswered) {
    goToSummaryPage();
    return null;
  }

  const isReadOnly = Boolean(isAdminView) || !canBeAnswered;

  return (
    <>
      <QuestionnaireLayout>
        <FormContext
          form={FormLayoutV2}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          displayPromptOnLeave={false}>
          <QuestionnaireContainer>
            {isAdminView && <Heading1>{metadata.title}</Heading1>}

            <QuestionnaireHeader
              data={{
                metadata,
                currentState: response.currentState,
                showScore: isAdminView,
              }}
            />
            <QuestionnaireBody sections={response.sections} isReadOnly={isReadOnly} />
            {!isAdminView && <QuestionnaireFormActions formSubmitted={formSubmitted} />}
          </QuestionnaireContainer>
          <FormLayoutV2.Footer>
            {canBeAnswered && (
              <FormLayoutV2.Actions>
                <Button variant={Variant.SECONDARY} onClick={onDiscardClick}>
                  Discard
                </Button>
                <Tooltip content="Send the link to recipients to ask them to respond to the questionnaire.">
                  <Button
                    onClick={() =>
                      showShareModal(
                        `/questionnaire-public/${responseKey}?accessKey=${encodeURIComponent(
                          accessKey as string
                        )}`
                      )
                    }>
                    Share Link
                  </Button>
                </Tooltip>
                {discardModalElement}
              </FormLayoutV2.Actions>
            )}
          </FormLayoutV2.Footer>
        </FormContext>
      </QuestionnaireLayout>
      {shareLinkModalElement}
      {submitModalElement}
    </>
  );
};

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 3rem;

  ${Input} {
    margin-top: 2rem;
  }
`;

const SubmitModal = styled(({ closeSubmitModal, handleSubmit, ...props }) => {
  const { toaster } = useInject();
  const { validateEmail } = useValidation();

  return (
    <ConfirmationModal
      {...props}
      title="Submit Answers"
      submitText="Submit"
      onError={() => toaster.error('Something went wrong')}
      onClose={closeSubmitModal}
      onSubmit={handleSubmit}>
      <FieldContainer>
        <Label required>Name</Label>
        <Description>Questions you answered will be marked with this name</Description>
        <InputControl placeholder="Type your name..." name="name" />
      </FieldContainer>

      <FieldContainer>
        <Label required>Email</Label>
        <Description>This email will be used to contact you if needed</Description>
        <InputControl
          placeholder="Type your email..."
          name="email"
          rules={{
            required: 'Email is required',
            validate: validateEmail,
          }}
        />
      </FieldContainer>
    </ConfirmationModal>
  );
})`
  ${(Modal as any).Content} {
    padding-top: 4rem;
  }
`;
