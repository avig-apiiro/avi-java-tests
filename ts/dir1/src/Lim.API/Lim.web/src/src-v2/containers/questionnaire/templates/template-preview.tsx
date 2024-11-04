import { useParams } from 'react-router-dom';
import { FormContext } from '@src-v2/components/forms';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { StickyHeader } from '@src-v2/components/layout';
import { Heading } from '@src-v2/components/typography';
import {
  Description,
  QuestionCard,
  QuestionnaireContainer,
  QuestionnaireLayout,
  QuestionnaireSection,
} from '@src-v2/containers/questionnaire/common-components';
import { AnswerEditor } from '@src-v2/containers/questionnaire/templates/template-editor';
import { useInject, useSuspense } from '@src-v2/hooks';

export const TemplatePreview = () => {
  const { questionnaires } = useInject();
  const { metadata, response } = useSuspense(questionnaires.getTemplatePreview, {
    templateKey: (useParams() as any).key,
  });

  return (
    <FormContext onSubmit={null}>
      <StickyHeader title={metadata.template} />
      <QuestionnaireLayout>
        <QuestionnaireContainer>
          {response.sections.map((section, index) => (
            <QuestionnaireSection key={index}>
              <Label>
                Section {++index} out of {response.sections.length}
              </Label>
              <Heading>{section.title}</Heading>
              <Description>{section.description}</Description>
              {section.questions.map(question => {
                return (
                  <QuestionCard
                    title={question.title}
                    description={question.description}
                    required={false}>
                    <AnswerEditor question={question} />
                  </QuestionCard>
                );
              })}
            </QuestionnaireSection>
          ))}
        </QuestionnaireContainer>
      </QuestionnaireLayout>
    </FormContext>
  );
};
