import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { CheckboxToggle, Combobox, FormContext, Input, Radio } from '@src-v2/components/forms';
import { FormActions } from '@src-v2/components/forms/form-actions';
import {
  CheckboxControl,
  GroupControlContainer,
  InputControl,
  RadioGroupControl,
  SelectControl,
  TextareaControl,
} from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { ModalRouteChangePrompt } from '@src-v2/containers/modals/route-prompt-message-modal';
import {
  DetailsFormContainer,
  QuestionCard as EditorCard,
  QuestionnaireSection,
  QuestionnaireContainer as TemplateEditorContainer,
} from '@src-v2/containers/questionnaire/common-components';
import { useConfirmDeleteModal } from '@src-v2/containers/questionnaire/hooks/use-confirm-delete-modal';
import { useConfirmEditTemplateModal } from '@src-v2/containers/questionnaire/hooks/use-confirm-edit-template-modal';
import { useTemplateEditor } from '@src-v2/containers/questionnaire/hooks/use-template-editor';
import { InputControlQuestion } from '@src-v2/containers/questionnaire/questionnaire-input-factory';
import {
  AddButton,
  ConditionDetails,
  ConditionToggle,
  EditorRow,
  QuestionEditor,
  RemoveButton,
  ScoreSelect,
  SectionTitleEditor,
} from '@src-v2/containers/questionnaire/templates/editor-components';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { MultipleErrors } from '@src-v2/types/multipleErrors';
import { Question } from '@src-v2/types/queastionnaire/template';
import { StubAny } from '@src-v2/types/stub-any';

const SECTIONS = 'sections' as const;
const QUESTIONS = 'questions' as const;
const QUESTION_ID = 'questionId' as const;
const CONDITION = 'enabledBy' as const;
const OPTIONS = 'options' as const;

export const TemplateEditor = styled(props => {
  const { key } = useParams<{ key: string }>();
  const isEditingTemplate = Boolean(key);
  const { questionnaires, toaster } = useInject();
  const template = useSuspense(questionnaires.getTemplate, key);
  const [successModalElement, setSuccessModal] = useModalState();
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showConfirmEditModal, editModalElement] = useConfirmEditTemplateModal();
  const history = useHistory();

  const initialState = {
    ...template,
    hasDescription: Boolean(template.description),
    sections: template.sections.map(section => ({
      ...section,
      hasDescription: Boolean(section.description),
      questions: section.questions.map(question => ({
        ...question,
        hasCondition: Boolean(question.enabledBy),
        options: question.options.map(option => ({
          ...option,
          score: option.score !== 0 ? option.score : option.score.toFixed(1), // the dropdown option is `0.0`, so format `0` accordingly
        })),
      })),
    })),
  };

  const handleSubmit = useCallback(
    async (data: StubAny) => {
      try {
        await questionnaires.saveTemplate({ id: key, ...data });
      } catch (err) {
        err instanceof MultipleErrors
          ? err.messages.forEach(m => toaster.error(m))
          : toaster.error(err.message);
        setFormSubmitting(false);
        return;
      }
      if (isEditingTemplate) {
        toaster.success('Changes saved successfully!');
        history.goBack();
        return;
      }

      setSuccessModal(
        <ConfirmationModal
          title="Template created successfully!"
          submitText="Create workflow"
          cancelText="Skip"
          onClose={() => history.push('/questionnaire/templates')}
          onSubmit={() => {
            history.push('/workflows');
          }}
          onError={e => console.log(e)}>
          <Paragraph>
            You can now create a Workflow to trigger a questionnaire whenever Apiiro detects risky
            features.
          </Paragraph>
        </ConfirmationModal>
      );
    },
    [history]
  );

  return (
    <div {...props}>
      <FormContext
        form={FormLayoutV2}
        defaultValues={initialState}
        onSubmit={data => {
          setFormSubmitting(true);
          if (isEditingTemplate) {
            showConfirmEditModal({
              handleSubmit: () => handleSubmit(data),
              handleCancel: () => setFormSubmitting(false),
            });
            return;
          }
          handleSubmit(data);
        }}
        displayPromptOnLeave={false}>
        <Editor formSubmitting={formSubmitting} />
      </FormContext>
      {successModalElement}
      {editModalElement}
    </div>
  );
})`
  ${TemplateEditorContainer}:not(:first-child):not(:last-child) {
    margin-top: 3rem;
  }
`;

const Editor = ({ formSubmitting, ...props }: { formSubmitting: StubAny }) => {
  const sectionRefs = useRef<null | HTMLElement[]>([]);
  const {
    setValue,
    watch,
    formState: { isDirty },
  } = useFormContext();

  const {
    template: { sections = [], ...template },
    appendSection,
  } = useTemplateEditor();
  // The default value of the form is passed to the FormContext

  const scrollIntoSection = useCallback(
    (sectionRef: HTMLElement) =>
      setTimeout(() => {
        sectionRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0),
    []
  );

  const history = useHistory();

  const hasDescription = watch('hasDescription');
  useEffect(() => !hasDescription && setValue('description', null), [hasDescription]);

  return (
    <>
      <FormLayoutV2.Container>
        <TemplateEditorContainer {...props}>
          <DetailsFormContainer>
            <Heading>Template details</Heading>
            <EditorCard required title="Template name" description="">
              <InputControlQuestion name="title" placeholder="Type a name for this template..." />
            </EditorCard>
            <ConditionToggle>
              <CheckboxControl name="hasDescription" Component={CheckboxToggle} />
              Description
            </ConditionToggle>
            {template.hasDescription && (
              <EditorCard title="Description" description="">
                <TextareaControl placeholder="Add a description..." name="description" />
              </EditorCard>
            )}
          </DetailsFormContainer>

          {sections?.map((section: StubAny, sectionIndex: number) => (
            <SectionEditor
              sectionIndex={sectionIndex}
              section={section}
              scrollIntoSection={scrollIntoSection}
              sectionRefs={sectionRefs}
            />
          ))}
          <AddButton
            data-add-section
            onClick={() => {
              appendSection();
              scrollIntoSection(sectionRefs.current[sectionRefs.current.length - 1]);
            }}>
            Add Section
          </AddButton>
        </TemplateEditorContainer>
      </FormLayoutV2.Container>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <FormActions onCancel={history.goBack} />
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
      <ModalRouteChangePrompt title="Discard Changes?" when={isDirty && !formSubmitting}>
        There are changes that will be discarded.
        <br />
        Are you sure?
      </ModalRouteChangePrompt>
    </>
  );
};

const SectionEditor = ({
  section: { questions, ...section },
  sectionIndex,
  sectionRefs,
  scrollIntoSection,
}: {
  section: StubAny;
  sectionIndex: number;
  sectionRefs: StubAny;
  scrollIntoSection: StubAny;
}) => {
  const sectionName = `${SECTIONS}[${sectionIndex}]`;
  const { watch, setValue } = useFormContext();

  const {
    template: { sections = [] },
    insertSection,
    addQuestion,
    deleteQuestion,
    removeSection,
  } = useTemplateEditor();

  const hasDescription = watch(`${sectionName}.hasDescription`);
  useEffect(
    () => !hasDescription && setValue(`${sectionName}.description`, null),
    [hasDescription]
  );

  return (
    <>
      <SectionContainer
        scrollRef={(section: StubAny) => (sectionRefs.current[sectionIndex] = section)}
        key={section.id}
        sectionIndex={sectionIndex}
        removeSection={removeSection}
        sectionsCount={sections.length}>
        <BorderlessCard>
          <SectionTitleEditor name={`${sectionName}.title`} />
        </BorderlessCard>
        <ConditionToggle>
          <CheckboxControl name={`${sectionName}.hasDescription`} Component={CheckboxToggle} />
          Description
        </ConditionToggle>
        {section.hasDescription && (
          <SectionDescription>
            <TextareaControl
              name={`${sectionName}.description`}
              placeholder="Add a description..."
            />
          </SectionDescription>
        )}

        {questions?.map((question: StubAny, questionIndex: number) => {
          const questionName = `${sectionName}.${QUESTIONS}.${questionIndex}`;

          return (
            <QuestionEditor key={question.id}>
              <QuestionBodyEditor
                name={questionName}
                deleteQuestion={() => deleteQuestion({ sectionIndex, questionIndex })}
              />
              <AnswerEditor name={questionName} question={question} />
              <QuestionConditionEditor
                question={question}
                questions={sections.flatMap((section: StubAny) => section.questions)}
                questionName={questionName}
              />
            </QuestionEditor>
          );
        })}
        <AddButton
          onClick={() => {
            addQuestion(sectionIndex);
          }}>
          Add Question
        </AddButton>
      </SectionContainer>

      {sectionIndex < sections.length - 1 && (
        <AddButton
          data-add-section
          onClick={() => {
            insertSection(sectionIndex);
            scrollIntoSection(sectionRefs.current[sectionIndex]);
          }}>
          Add Section
        </AddButton>
      )}
    </>
  );
};

const SectionContainer = ({
  children,
  removeSection,
  sectionIndex,
  sectionsCount,
  scrollRef,
}: {
  children: ReactNode;
  removeSection: StubAny;
  sectionIndex: number;
  sectionsCount: number;
  scrollRef: StubAny;
}) => {
  const deleteSection = useCallback(
    () => removeSection(sectionIndex),
    [sectionIndex, removeSection]
  );
  const [showDeleteSectionModal, deleteSectionModal] = useConfirmDeleteModal({
    handleDelete: deleteSection,
    title: 'Discard this section?',
  });

  return (
    <QuestionnaireSectionWithMoreRightPadding ref={scrollRef}>
      <BorderlessCard>
        <EditorRow>
          <Label data-section-index>
            Section {sectionIndex + 1} out of {sectionsCount}
          </Label>
          <RemoveButton onClick={showDeleteSectionModal} />
        </EditorRow>
      </BorderlessCard>
      {children}
      {deleteSectionModal}
    </QuestionnaireSectionWithMoreRightPadding>
  );
};

const QuestionBodyEditor = styled(({ name: questionName, deleteQuestion, ...props }) => {
  const [showDeleteModal, deleteModalElement] = useConfirmDeleteModal({
    handleDelete: deleteQuestion,
  });

  return (
    <>
      <EditorRow>
        <InputControl
          {...props}
          data-display
          placeholder="Type a question..."
          name={`${questionName}.title`}
        />
        <RemoveButton onClick={showDeleteModal} />
      </EditorRow>
      <TextareaControl placeholder="Add a description..." name={`${questionName}.description`} />
      {deleteModalElement}
    </>
  );
})`
  &${Input} {
    width: 100%;
    font-weight: 600;
    color: black;
  }
`;

export const AnswerEditor = styled(
  ({ name: questionName, question, ...props }: { name?: string; question: Question }) => {
    const isReadonly = !questionName;
    return (
      <>
        <GroupControlContainer {...props}>
          {question.options?.map((option: { value: string; score: number }, index: number) => (
            <EditorRow>
              <RadioGroupControl.Label key={`${questionName}.${OPTIONS}.${index}.answer`}>
                <Radio disabled />
                {option.value}
              </RadioGroupControl.Label>
              {isReadonly ? (
                option.score > 0 && <span>{option.score} pts</span>
              ) : (
                <ScoreSelect name={`${questionName}.${OPTIONS}.${index}.score`} />
              )}
            </EditorRow>
          ))}
        </GroupControlContainer>
      </>
    );
  }
)`
  color: var(--color-blue-gray-30);

  ${RadioGroupControl.Label} {
    ${Input} {
      width: 100%;
    }
  }
`;

const QuestionConditionEditor = styled(
  ({
    questionName,
    question,
    questions,
    ...props
  }: {
    questionName: string;
    question: StubAny;
    questions: StubAny[];
  }) => {
    const otherQuestions = useMemo(
      () =>
        questions
          .filter(item => item.title && item.id !== question.id)
          .map(({ title, id, options }) => ({ title, id, options })),
      [questions, question, questionName]
    );

    const { setValue, getValues, watch } = useFormContext();

    const hasCondition = watch(`${questionName}.hasCondition`);
    const { id, options } = otherQuestions?.[0] ?? { id: 'nothing', options: [] };
    useEffect(() => {
      if (!hasCondition) {
        setValue(`${questionName}.${CONDITION}`, null);
        return;
      }

      setValue(
        `${questionName}.${CONDITION}.${QUESTION_ID}`,
        getValues(`${questionName}.${CONDITION}.${QUESTION_ID}`) ?? id
      );
      setValue(
        `${questionName}.${CONDITION}.answer`,
        getValues(`${questionName}.${CONDITION}.answer`) ?? options?.[0].value
      );
    }, [hasCondition]);

    return (
      otherQuestions.length > 0 && (
        <div {...props}>
          <ConditionToggle>
            <CheckboxControl name={`${questionName}.hasCondition`} Component={CheckboxToggle} />
            Condition
          </ConditionToggle>

          {Boolean(question.hasCondition) && (
            <>
              if the answer to question
              <SelectControl
                placeholder="Select a question"
                name={`${questionName}.${CONDITION}.${QUESTION_ID}`}
                clearable={false}
                items={otherQuestions.map(question => question.id)}
                itemToString={questionId =>
                  otherQuestions.find(question => question.id === questionId)?.title
                }
              />
              <ConditionDetails>
                is
                <SelectControl
                  clearable={false}
                  name={`${questionName}.${CONDITION}.answer`}
                  items={question.options?.map((option: StubAny) => option.value)}
                />
                <Paragraph> then enable this question</Paragraph>
              </ConditionDetails>
            </>
          )}
        </div>
      )
    );
  }
)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  border-top: 1px solid var(--color-blue-gray-30);
  padding-top: 2rem;
  margin-top: 2rem;

  ${Combobox}, ${Combobox.InputContainer}, ${Input} {
    width: 100%;
  }

  ${ConditionDetails} {
    ${Input} {
      width: 26rem;
    }

    ${Paragraph} {
      white-space: nowrap;
    }
  }
`;

const SectionDescription = styled.div`
  margin-left: 2rem;
  margin-top: 2rem;
  width: 100%;
`;

const QuestionnaireSectionWithMoreRightPadding = styled(QuestionnaireSection)`
  padding-right: 12rem;
`;

const BorderlessCard = styled.div`
  margin: 2rem;
  gap: 2rem;
  width: 100%;
`;
