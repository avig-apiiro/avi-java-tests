import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink, Heading, Paragraph, Strong } from '@src-v2/components/typography';
import { ProgressStatus } from '@src-v2/containers/questionnaire/common-components';
import { useInject, useQueryParams, useSuspense } from '@src-v2/hooks';
import { Status } from '@src-v2/types/queastionnaire/questionnaire-response';

export const QuestionnaireSummary = styled(({ responseKey, ...props }) => {
  const history = useHistory();
  const { questionnaires } = useInject();

  const {
    queryParams: { accessKey },
  } = useQueryParams();

  const {
    metadata: { template, triggeringIssue, title },
    response: { currentState },
  } = useSuspense(questionnaires.getQuestionnaire, { responseKey, accessKey });

  return (
    <Card {...props}>
      <InfoSection>
        <Heading>Questionnaire Details</Heading>

        <Paragraph>
          Template name <Strong> {template} </Strong>
        </Paragraph>

        {Boolean(triggeringIssue) && (
          <Paragraph>
            Trigger <VendorIcon name={triggeringIssue.provider} />{' '}
            <ExternalLink href={triggeringIssue.externalUrl}>{triggeringIssue.id}</ExternalLink>{' '}
            <Strong> {title} </Strong>
          </Paragraph>
        )}
        <ProgressStatus currentState={currentState} />
      </InfoSection>
      {currentState.status !== Status.Discarded && (
        <SummarySection>
          <Paragraph>Your answers have been submitted!</Paragraph>
          <TextButton
            onClick={history.goBack}
            underline
            mode={LinkMode.INTERNAL}
            size={Size.XSMALL}>
            Submit another response
          </TextButton>
        </SummarySection>
      )}
    </Card>
  );
})`
  display: flex;
  flex-direction: column;
  width: 190rem;
  padding: 6rem;
  margin: auto;
  margin-top: 6rem;
  gap: 4rem;
`;

const InfoSection = styled.div`
  ${Heading} {
    font-size: 4rem;
    font-weight: 600;
  }

  ${Paragraph} {
    display: flex;
    align-items: center;
    font-size: 4rem;
    font-weight: 200;
    gap: 2rem;
  }

  ${Strong}, ${ExternalLink} {
    font-weight: 400;
  }
`;

const SummarySection = styled(InfoSection)`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${Paragraph} {
    line-height: 18px;
    border-top: 1px solid var(--color-blue-gray-20);
    padding-top: 4rem;
    font-weight: 500;
    font-size: var(--font-size-xl);
  }
`;
