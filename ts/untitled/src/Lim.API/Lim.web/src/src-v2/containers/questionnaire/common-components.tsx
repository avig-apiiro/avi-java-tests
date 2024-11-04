import styled from 'styled-components';
import { Card, RibbonCard } from '@src-v2/components/cards';
import { Combobox, Input } from '@src-v2/components/forms';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Heading, Heading1, Light, Paragraph, Strong } from '@src-v2/components/typography';
import { SearchInputQuestion } from '@src-v2/containers/questionnaire/questionnaire-input-factory';
import { QuestionnaireState, Status } from '@src-v2/types/queastionnaire/questionnaire-response';
import { StubAny } from '@src-v2/types/stub-any';
import { StyledProps } from '@src-v2/types/styled';
import { toPercent } from '@src-v2/utils/number-utils';
import { humanize } from '@src-v2/utils/string-utils';

export const Description = styled(Light)`
  font-size: 14px;
  font-weight: 200;
  color: var(--color-blue-gray-60);
`;

export const QuestionnaireSection = styled<any>(RibbonCard)`
  --card-ribbon-angle: 180deg;
  --card-ribbon-size: 2rem;
  --card-ribbon-color: var(--color-purple-45);

  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
  width: 190rem;
  height: fit-content;
  padding: 6rem 8rem;
  margin-top: 6rem;
  border-radius: 3rem;
  gap: 1rem;

  > ${Label} {
    color: var(--color-blue-gray-50);
    font-size: 3.5rem;
    font-weight: 300;
    margin-top: 2rem;
  }

  > ${Heading} {
    font-size: 6rem;
    font-weight: 400;
    margin: 0;
  }

  > ${Description} {
    margin-bottom: 2rem;
  }
`;

export const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;

  > ${Label} {
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-blue-gray-40);
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  &[data-required] * {
    font-size: 6rem;
    font-weight: 400;
    margin: 0;
  }
`;

export const QuestionnaireContainer = styled(FormLayoutV2.Container)`
  ${Label} {
    color: var(--color-purple-50);
    margin-top: 0;
    margin-bottom: 2rem;
    font-weight: 600;
  }
`;

export const QuestionnaireLayout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-blue-gray-10);

  ${Heading1} {
    align-self: flex-start;
  }
`;

export const QuestionCard = styled(
  ({
    children,
    title,
    description,
    required,
    ...props
  }: StyledProps<{
    title?: string;
    description?: string;
    required?: boolean;
  }>) => (
    //@ts-ignore
    <Card {...props}>
      <QuestionContainer>
        <QuestionHeader title={title} description={description} required={required} />
        {children}
      </QuestionContainer>
    </Card>
  )
)`
  width: 100%;
  margin-bottom: 4rem;
  --card-padding: 4rem 5rem;

  ${Input}:not([data-display]) {
    width: 100%;
    border-right: 0;
    border-top: 0;
    border-left: 0;
    border-bottom: 0.25rem solid var(--color-blue-gray-30);
    border-radius: 0;

    :disabled {
      color: var(--color-blue-gray-70);
      border-top-right-radius: 5px;
      border-top-left-radius: 5px;
    }
  }
`;

export const QuestionHeader = ({
  title,
  description,
  required,
}: {
  title?: string;
  description?: string;
  required?: boolean;
}) => (
  <HeaderContainer>
    {Boolean(title) && <Label required={required}>{title}</Label>}
    {Boolean(description) && (
      <Description>
        {description.split('\n').map(line => (
          <>
            {line} <br />
          </>
        ))}
      </Description>
    )}
  </HeaderContainer>
);

const HeaderContainer = styled.div`
  ${Label} {
    font-size: 4rem;
    color: var(--color-blue-gray-70);
    font-weight: 400;
    margin-bottom: 1rem;
  }

  ${Description} {
    display: flex;
    align-items: center;
    margin-top: 1rem;
  }
`;

export const ProgressStatus = ({ currentState }: { currentState: StubAny }) => {
  return (
    <Paragraph>
      Status:{' '}
      <StatusContent>
        <ProgressIndicator status={currentState.status} />
        <Strong>
          {humanize(currentState.status)}{' '}
          {currentState.status === Status.InProgress &&
            `(${toPercent(currentState.percentCompleted, 0)})`}
        </Strong>
      </StatusContent>
    </Paragraph>
  );
};

const StatusContent = styled.span`
  display: inherit;
`;

const formatStatusTooltip = (status: Status) => {
  switch (status) {
    case Status.Pending:
      return 'None of the questions are currently answered. Anyone with a link to the questionnaire can change the responses.';
    case Status.InProgress:
      return 'Some of the questions are answered. Anyone with a link to the questionnaire can change the responses.';
    case Status.Done:
      return ' All questions answered. Anyone with a link to the questionnaire can change the responses.';
    case Status.Discarded:
      return 'The questionnaire is no longer accepting answers.';
    default:
      throw new Error(`unknown status: ${status}`);
  }
};

export const ProgressIndicator = styled(
  ({ status, ...props }: { status: QuestionnaireState['status'] }) => (
    <Tooltip content={formatStatusTooltip(status)}>
      <span data-status={status} {...props} />
    </Tooltip>
  )
)`
  display: flex;
  width: 2rem;
  height: 2rem;
  border-radius: 100vmax;
  margin: 1.75rem 1.5rem;
  background-color: var(--color-orange-45);

  &[data-status='${Status.Pending}'] {
    background-color: var(--color-blue-60);
  }

  &[data-status='${Status.Done}'] {
    background-color: var(--color-green-50);
  }

  &[data-status='${Status.Discarded}'] {
    background-color: var(--color-blue-gray-35);
  }

  &[data-status='${Status.InProgress}'] {
    background-color: var(--color-orange-50);
  }
`;

export const DetailsFormContainer = styled(QuestionnaireSection)`
  background: var(--color-white);

  > ${Card} {
    box-shadow: none;
    padding: 0;
    margin: 2rem 0;

    ${Paragraph} {
      color: var(--color-blue-gray-55);
    }

    ${QuestionContainer} {
      gap: 1rem;
    }

    ${Input} {
      width: 100%;
      border: 0.25rem solid var(--color-blue-gray-30);
      border-radius: 1rem;
    }

    ${Heading} {
      font-size: var(--font-size-xl);
      margin-bottom: 2rem;
    }

    ${QuestionCard} {
      margin: 2rem 0;
    }

    ${Combobox} {
      padding: 0;
    }

    ${Label} {
      font-size: var(--font-size-s);
      margin-bottom: 0;
    }

    ${Description} {
      font-size: var(--font-size-xs);
      margin-top: 0;
    }
  }

  ${SearchInputQuestion} ${Combobox} {
    display: flex;
    min-width: 40rem;
    flex-grow: 0;
    flex-wrap: nowrap;
    font-size: var(--font-size-xs);
    color: black;
  }
`;
