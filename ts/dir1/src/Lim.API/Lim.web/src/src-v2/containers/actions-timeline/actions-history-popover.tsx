import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Avatar } from '@src-v2/components/avatar';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import {
  ActionCircleMode,
  ActionTakenCircle,
} from '@src-v2/components/circles/action-taken-circle';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { DateTime } from '@src-v2/components/time';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Size } from '@src-v2/components/types/enums/size';
import {
  Caption1,
  Heading,
  Heading4,
  ListItem,
  TextLink,
  UnorderedList,
} from '@src-v2/components/typography';
import { CommentDescription } from '@src-v2/containers/actions-timeline/comment-description';
import { IssueDescription } from '@src-v2/containers/actions-timeline/issue-description';
import { MessageDescription } from '@src-v2/containers/actions-timeline/message-description';
import { ActionTakenDetails, ActionsTakenSummary } from '@src-v2/types/risks/action-taken-details';
import { makeUrl } from '@src-v2/utils/history-utils';
import { pluralFormat } from '@src-v2/utils/number-utils';

export const ActionsHistoryPopover = styled(Popover as any)`
  ${(Popover as any).Content} {
    min-width: 90rem;
    max-width: 125rem;
    padding: 4rem;

    ${(Popover as any).Head} {
      display: flex;
      gap: 2rem;
      padding: 4rem;

      ${Heading} {
        flex-grow: 1;
        margin-bottom: 0;
        font-size: var(--font-size-m);
        font-weight: 600;
      }

      > ${TextLink} {
        font-size: var(--font-size-s);
      }
    }

    ${UnorderedList} {
      padding: 4rem;

      ${ListItem} {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding: 0.5rem 0;
        font-size: var(--font-size-s);

        &:not(:last-child) {
          position: relative;
          margin-bottom: 4rem;

          &:after {
            content: '';
            position: absolute;
            bottom: -4rem;
            left: 3.375rem;

            height: 4rem;
            width: 0.25rem;
            background-color: var(--color-blue-gray-20);
            border-radius: 3rem;
          }
        }

        ${Avatar} {
          width: 7rem;
          height: 7rem;
          font-size: var(--font-size-xs);
        }
      }
    }
  }
`;

export const ActionsHistoryContent = ({
  summary,
  mode,
  itemToTimelineLink,
}: {
  summary: ActionsTakenSummary;
  mode: string;
  itemToTimelineLink?: (location?: Location) => { pathname: string; query: any };
}) => {
  const location = useLocation();
  const generateTimelineLink = useCallback(
    (location, summaryType: string) => {
      if (!itemToTimelineLink) {
        return null;
      }

      const { pathname, query } = itemToTimelineLink(location);
      return makeUrl(pathname, { ...query, pane: 'timeline', filter: summaryType }) as string;
    },
    [itemToTimelineLink]
  );

  let headingContent, IconComponent, iconName, callToAction;

  switch (summary.type) {
    case 'Issue':
      headingContent = `${summary.items.length} ${summary.provider} ${pluralFormat(
        summary.items.length,
        summary.provider === 'Jira' ? 'ticket' : 'issue'
      )} created`;
      IconComponent = VendorIcon;
      iconName = summary.provider;
      break;
    case 'Comment':
      headingContent = `${summary.items.length} ${pluralFormat(
        summary.items.length,
        'comment'
      )} added`;
      callToAction = 'View Comments';
      IconComponent = SvgIcon;
      iconName = summary.type;
      break;
    case 'Message':
      headingContent = `${summary.items.length} ${pluralFormat(
        summary.items.length,
        'message'
      )} sent`;
      IconComponent = VendorIcon;
      iconName = summary.provider;
      break;
    default:
      console.warn(`Unexpected summary type: ${summary.type}`);
      return null;
  }

  return (
    <>
      <Popover.Head>
        <ActionTakenHeadingContainer>
          <ActionTakenCircle size={Size.MEDIUM} mode={mode as ActionCircleMode}>
            <IconComponent name={iconName} />
          </ActionTakenCircle>
          <Heading4>{headingContent}</Heading4>
        </ActionTakenHeadingContainer>
        {itemToTimelineLink && (
          <TextButton
            to={String(generateTimelineLink(location, summary.type))}
            showArrow
            size={Size.XSMALL}
            mode={LinkMode.INTERNAL}>
            {callToAction ?? <>View timeline</>}
          </TextButton>
        )}
      </Popover.Head>
      <UnorderedList>
        {summary.items.map((item, index) => (
          <ActionTakenItem key={index} data={item} />
        ))}
      </UnorderedList>
    </>
  );
};

const ActionTakenItem = ({ data }: { data: ActionTakenDetails }) => (
  <ListItem>
    {data.isAutomated ? (
      <ActionTakenCircle size={Size.MEDIUM} mode={ActionCircleMode.automated}>
        <VendorIcon name="Apiiro" />
      </ActionTakenCircle>
    ) : (
      <Avatar size={Size.MEDIUM} username={data.createdBy} />
    )}

    <LinesContainer>
      <Heading>
        {data.type === 'Issue' ? (
          <IssueDescription issueDetails={data} />
        ) : data.type === 'Comment' ? (
          <CommentDescription commentDetails={data} />
        ) : (
          <MessageDescription messageDetails={data} />
        )}
      </Heading>
      <Caption1>
        <DateTime date={data.createdAt} format="PP" /> at {/*@ts-ignore*/}
        <DateTime date={data.createdAt} format="p" />
      </Caption1>
    </LinesContainer>
  </ListItem>
);

const ActionTakenHeadingContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const LinesContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${Heading} {
    margin-bottom: 0;
    font-size: var(--font-size-xs);
    font-weight: 400;
  }

  ${Caption1} {
    font-weight: 300;
  }
`;
