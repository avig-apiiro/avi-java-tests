import { Label } from '@src-v2/components/forms/modal-form-layout';
import { Heading } from '@src-v2/components/typography';
import {
  Description,
  QuestionnaireSection,
} from '@src-v2/containers/questionnaire/common-components';
import { useEnabledQuestions } from '@src-v2/containers/questionnaire/hooks/use-enabled-questions';
import { QuestionnaireQuestion } from '@src-v2/containers/questionnaire/questionnaire-question';
import { Section } from '@src-v2/types/queastionnaire/questionnaire-response';

export const QuestionnaireBody = ({
  sections,
  isReadOnly,
}: {
  sections: Section[];
  isReadOnly: boolean;
}) => {
  const enabledQuestions = useEnabledQuestions(sections);
  return (
    <>
      {sections.map((section, index) => (
        <QuestionnaireSection key={index}>
          <Label>
            Section {++index} out of {sections.length}
          </Label>
          <Heading>{section.title}</Heading>
          <Description>{section.description}</Description>
          {section.questions.map((question, index) => {
            return (
              enabledQuestions.includes(question.id) && (
                <QuestionnaireQuestion question={question} disabled={isReadOnly} key={index} />
              )
            );
          })}
        </QuestionnaireSection>
      ))}
    </>
  );
};
