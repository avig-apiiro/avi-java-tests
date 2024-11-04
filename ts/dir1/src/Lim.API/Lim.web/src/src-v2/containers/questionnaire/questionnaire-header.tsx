import styled from 'styled-components';
import { Card } from '@src-v2/components/cards';
import { BaseIcon, VendorIcon } from '@src-v2/components/icons';
import { ExternalLink, Heading, Paragraph, Strong } from '@src-v2/components/typography';
import { Description, ProgressStatus } from '@src-v2/containers/questionnaire/common-components';

export const QuestionnaireHeader = styled(
  ({ data: { currentState, showScore, metadata }, ...props }) => {
    const { title, description, template, triggeringIssue } = metadata;
    return (
      <Card {...props}>
        <InfoSection>
          <Heading>Questionnaire details</Heading>
          {Boolean(triggeringIssue) && (
            <Paragraph>
              Trigger:
              <QuestionnaireTrigger>
                <VendorIcon name={triggeringIssue.provider} />{' '}
                <ExternalLink href={triggeringIssue.externalUrl}>{triggeringIssue.id}</ExternalLink>{' '}
              </QuestionnaireTrigger>
              <Strong> {title} </Strong>
            </Paragraph>
          )}
          <Paragraph>
            Template name: <Strong> {template} </Strong>
          </Paragraph>
          <ProgressStatus currentState={currentState} />
          {showScore && (
            <Paragraph>
              Risk score: <Strong> {currentState.score} </Strong>
            </Paragraph>
          )}
        </InfoSection>
        {Boolean(description) && (
          <DetailsSection>
            <Heading>Description</Heading>
            <Description>{description}</Description>
          </DetailsSection>
        )}
      </Card>
    );
  }
)`
  display: flex;
  flex-direction: column;
  width: 190rem;
  padding: 6rem;
  margin-top: 6rem;
  gap: 3rem;
  font-size: var(--font-size-s);
`;

const InfoSection = styled.div`
  ${Heading} {
    font-size: 4rem;
    font-weight: 400;
  }

  ${Paragraph} {
    display: flex;
    align-items: center;
    font-size: var(--font-size-s);
    font-weight: 200;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  ${Strong}, ${ExternalLink} {
    font-weight: 300;
    font-size: var(--font-size-s);
  }

  ${BaseIcon} {
    width: 4rem;
    height: 4rem;
  }
`;

const DetailsSection = styled(InfoSection)`
  line-height: 18px;
`;

const QuestionnaireTrigger = styled.span`
  display: flex;
  gap: 1rem;
  align-items: center;
`;
