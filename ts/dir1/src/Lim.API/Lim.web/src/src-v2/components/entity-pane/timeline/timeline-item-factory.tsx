import { format } from 'date-fns';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { RiskStatusIndicator } from '@src-v2/components/activity-indicator';
import { Avatar } from '@src-v2/components/avatar';
import { Card, CollapsibleCard } from '@src-v2/components/cards';
import {
  ActionCircleMode,
  ActionTakenCircle,
} from '@src-v2/components/circles/action-taken-circle';
import { RiskOverrideEvent, TimelineEvent } from '@src-v2/components/entity-pane/timeline/timeline';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink, Heading4, Link, Paragraph } from '@src-v2/components/typography';
import { DueDateChangeDescription } from '@src-v2/containers/actions-timeline/due-date-change-description';
import { IssueDescription } from '@src-v2/containers/actions-timeline/issue-description';
import { MessageDescription } from '@src-v2/containers/actions-timeline/message-description';
import { Provider } from '@src-v2/types/enums/provider';
import { RiskLevel, RiskStatus } from '@src-v2/types/enums/risk-level';
import {
  CommentTimelineEvent,
  DueDateChangeTimelineEvent,
  EntityEvent,
} from '@src-v2/types/inventory-elements/entity-event';
import { ActionTakenDetails } from '@src-v2/types/risks/action-taken-details';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { humanize } from '@src-v2/utils/string-utils';

export function TimelineItemFactory({
  relatedEntityKey,
  item,
}: {
  relatedEntityKey: string;
  item: TimelineEvent;
}) {
  switch (item.type) {
    case 'Message':
    case 'Issue':
      return <ActionItemCard item={item as ActionTakenDetails} />;

    case 'RiskOverrideEvent':
      return <RiskOverrideCard item={item as RiskOverrideEvent} />;

    case 'DueDateChange':
      return <DueDateChangedCard item={item as DueDateChangeTimelineEvent} />;

    case 'Comment':
      return <CommentCard item={item as CommentTimelineEvent} />;

    default:
      return <EntityEventItemCard item={item as EntityEvent} repositoryKey={relatedEntityKey} />;
  }
}

function ActionItemCard({ item }: { item: ActionTakenDetails }) {
  return (
    <>
      <ActionTakenCircle
        size={Size.MEDIUM}
        mode={item.isAutomated ? ActionCircleMode.automated : ActionCircleMode.manual}>
        <VendorIcon name={item.provider} size={Size.XSMALL} />
      </ActionTakenCircle>
      <Card>
        <TitleContainer>
          {item.type === 'Issue' ? (
            <IssueTakenContent item={item} />
          ) : (
            <MessageTakenContent item={item} />
          )}
        </TitleContainer>
      </Card>
    </>
  );
}

function DueDateChangedCard({ item }: { item: DueDateChangeTimelineEvent }) {
  return (
    <>
      <ActionTakenCircle size={Size.MEDIUM} mode={ActionCircleMode.manual}>
        <SvgIcon name="Calendar" size={Size.XSMALL} />
      </ActionTakenCircle>
      <Card>
        <TitleContainer>
          <Heading4>Due date changed</Heading4>
          <AvatarDescriptionContainer>
            <Avatar username={item.createdBy} size={Size.SMALL} />
            <CardDescription>
              <DueDateChangeDescription details={item} />
              {item.overrideActionProvider?.source === Provider.Jira && (
                <>
                  {' '}
                  via Jira on{' '}
                  <ExternalLink href={item.overrideActionProvider.issueLink}>
                    {item.overrideActionProvider.jiraIssueId}
                  </ExternalLink>{' '}
                </>
              )}{' '}
              at {format(item.createdAt, 'p')}
            </CardDescription>
          </AvatarDescriptionContainer>
        </TitleContainer>
      </Card>
    </>
  );
}

function CommentCard({ item }: { item: CommentTimelineEvent }) {
  if (!item.message) {
    return null;
  }

  return (
    <>
      <ActionTakenCircle size={Size.MEDIUM} mode={ActionCircleMode.manual}>
        <SvgIcon name="Comment" size={Size.XSMALL} />
      </ActionTakenCircle>
      <CollapsibleCard
        defaultOpen
        title={
          <TitleContainer>
            <Heading4>Comment added</Heading4>
            <AvatarDescriptionContainer>
              <Avatar username={item.createdBy} size={Size.SMALL} />
              <CardDescription>
                {item.commentSourceData?.source === Provider.Jira ? (
                  <>
                    A comment by {item.createdBy} via Jira on{' '}
                    <ExternalLink href={item.commentSourceData.issueLink} onClick={stopPropagation}>
                      {item.commentSourceData.jiraIssueId}
                    </ExternalLink>{' '}
                    at {format(item.createdAt, 'p')}
                  </>
                ) : (
                  <>
                    Added by {item.createdBy} at {format(item.createdAt, 'p')}
                  </>
                )}
              </CardDescription>
            </AvatarDescriptionContainer>
          </TitleContainer>
        }>
        <CommentMessageContainer>
          <CommentMessage>"{item.message}"</CommentMessage>
        </CommentMessageContainer>
      </CollapsibleCard>
    </>
  );
}

function IssueTakenContent({ item }: { item: ActionTakenDetails }) {
  return (
    <TitleContainer>
      <Heading4>
        {humanize(item.provider)} {item.provider === 'Jira' ? 'ticket' : 'issue'}{' '}
        {item.isLinkedManually ? 'was linked' : 'created'}
      </Heading4>
      <AvatarDescriptionContainer>
        <ActionItemIcon item={item} />
        <CardDescription>
          <IssueDescription issueDetails={item} inlineCreateAt />
        </CardDescription>
      </AvatarDescriptionContainer>
    </TitleContainer>
  );
}

function MessageTakenContent({ item }: { item: ActionTakenDetails }) {
  return (
    <TitleContainer>
      <Heading4>{humanize(item.provider)} message sent</Heading4>
      <AvatarDescriptionContainer>
        <ActionItemIcon item={item} />
        <CardDescription>
          <MessageDescription messageDetails={item} inlineCreateAt />
        </CardDescription>
      </AvatarDescriptionContainer>
    </TitleContainer>
  );
}

const RiskOverrideCard = observer(({ item }: { item: RiskOverrideEvent }) => {
  const isOverrideRiskLevel =
    item.riskLevel &&
    RiskLevel[item.riskLevel] !== RiskLevel.AutoIgnored &&
    RiskLevel[item.riskLevel] !== RiskLevel.Ignored &&
    RiskLevel[item.riskLevel] !== RiskLevel.Accepted;

  const isOverrideRiskStatus = Boolean(item.riskStatus);
  const title = isOverrideRiskLevel
    ? 'Risk level changed'
    : isOverrideRiskStatus
      ? 'Risk status changed'
      : `Risk ${humanize(item.riskLevel)?.toLowerCase()}`;

  const header = (
    <TitleContainer>
      <Heading4>{title}</Heading4>
      <AvatarDescriptionContainer>
        <Avatar username={item.createdBy} size={Size.SMALL} />
        <CardDescription>
          Changed to {humanize(isOverrideRiskLevel ? item.riskLevel : item.riskStatus)}{' '}
          {item.changedByType === 'Api' ? ' via API, token: ' : ' by '}
          {item.createdBy} at {format(item.createdAt, 'p')}
        </CardDescription>
      </AvatarDescriptionContainer>
    </TitleContainer>
  );

  const itemReason = item.reason ? (
    <CommentMessageContainer>
      <CommentMessage> Reason: {item.reason} </CommentMessage>
    </CommentMessageContainer>
  ) : null;

  return (
    <>
      <ActionTakenCircle size={Size.MEDIUM} mode={ActionCircleMode.manual}>
        {isOverrideRiskLevel && <RiskIcon riskLevel={item.riskLevel} size={Size.XSMALL} />}
        {isOverrideRiskStatus && <RiskStatusIndicator status={RiskStatus[item.riskStatus]} />}
      </ActionTakenCircle>
      {item.reason ? (
        <CollapsibleCard title={header}>{itemReason}</CollapsibleCard>
      ) : (
        <Card>
          {header}
          {itemReason}
        </Card>
      )}
    </>
  );
});

function EntityEventItemCard({
  item,
  repositoryKey,
}: {
  item: EntityEvent;
  repositoryKey: string;
}) {
  return (
    <>
      <ActionTakenCircle size={Size.MEDIUM}>
        <RiskIcon riskLevel={item.riskLevel} size={Size.XSMALL} />
      </ActionTakenCircle>
      <Card>
        <TitleContainer>
          <Heading4>{item.label}</Heading4>
          <AvatarDescriptionContainer>
            {item.developer && <Avatar size={Size.SMALL} {...item.developer} />}
            <CardDescription>
              Commit <Link to={`/commit/${repositoryKey}/${item.commitSha}`}>{item.shortSha}</Link>{' '}
              {item.developer && (
                <>
                  by{' '}
                  <Link to={`/users/contributors/${item.developer.identityKey}`}>
                    {item.developer.username}
                  </Link>
                </>
              )}{' '}
              at {format(item.createdAt, 'p')}
            </CardDescription>
          </AvatarDescriptionContainer>
        </TitleContainer>
      </Card>
    </>
  );
}

function ActionItemIcon({ item }: { item: ActionTakenDetails }) {
  return item.isAutomated ? (
    <ActionTakenCircle size={Size.MEDIUM} mode={ActionCircleMode.automated}>
      <VendorIcon name="Apiiro" size={Size.XSMALL} />
    </ActionTakenCircle>
  ) : (
    <Avatar username={item.createdBy} size={Size.SMALL} />
  );
}

const CommentMessage = styled.div`
  padding: 3rem 4rem;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const CommentMessageContainer = styled.div`
  background: var(--color-blue-gray-15);
  margin-bottom: 4rem;
  overflow: hidden;
`;

const CardDescription = styled(Paragraph)`
  align-self: center;
  margin-bottom: 0 !important; /* overriding paragraph margin style, until its removed */
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
`;

const AvatarDescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
