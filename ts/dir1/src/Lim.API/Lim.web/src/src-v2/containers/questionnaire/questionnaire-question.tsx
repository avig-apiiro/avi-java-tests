import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { IconPopover } from '@src-v2/components/coverage-table/coverage-cells';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Light, Paragraph, Strong } from '@src-v2/components/typography';
import { QuestionCard } from '@src-v2/containers/questionnaire/common-components';
import { QuestionnaireInputFactory } from '@src-v2/containers/questionnaire/questionnaire-input-factory';
import { Question, Respondent } from '@src-v2/types/queastionnaire/questionnaire-response';
import { StyledProps } from '@src-v2/types/styled';

export const QuestionnaireQuestion = ({
  question: { id, title, description, type, options, answer, answeredBy, score },
  disabled,
  ...props
}: {
  question: Question;
  disabled: boolean;
}) => {
  return (
    <QuestionCard {...props} title={title} description={description} required={false}>
      <QuestionnaireInputFactory
        type={type}
        answer={answer}
        options={options}
        id={id}
        disabled={disabled}
      />
      {answeredBy?.name && <AnswerFooter questionId={id} answeredBy={answeredBy} score={score} />}
    </QuestionCard>
  );
};

const EmailPopover = styled(IconPopover)`
  ${(Popover as any).Content} {
    min-width: 0;
  }
`;

const ChangeIndicatorContainer = styled.span`
  color: var(--color-orange-50);
  margin-left: 2rem;
`;

const ScoreContainer = styled.span`
  margin-left: auto;
`;

const AnswerFooter = styled(
  ({
    questionId,
    answeredBy,
    score,
    ...props
  }: StyledProps<{ questionId: string; answeredBy: Respondent; score: number }>) => {
    const {
      formState: { dirtyFields },
    } = useFormContext();
    const isDirty = Object.keys(dirtyFields).includes(questionId);

    return (
      <Paragraph {...props}>
        <Light>Last changed by </Light>
        <EmailPopover
          content={
            <>
              {answeredBy.email}{' '}
              <IconButton
                name="Copy"
                onClick={() => navigator.clipboard.writeText(answeredBy.email)}
              />
            </>
          }>
          <Strong>{answeredBy.name}</Strong>
        </EmailPopover>
        {isDirty && <ChangeIndicatorContainer>(Changed by you)</ChangeIndicatorContainer>}
        {score > 0 && (
          <ScoreContainer>
            <Light>Score:</Light> <Strong>{score}</Strong>
          </ScoreContainer>
        )}
      </Paragraph>
    );
  }
)`
  display: flex;
  font-size: 3rem;

  ${Light} {
    color: var(--color-blue-gray-50);
    font-weight: 200;
    margin-right: 1rem;
  }

  ${Strong} {
    font-weight: 500;
    color: var(--color-blue-gray-60);
  }
`;
