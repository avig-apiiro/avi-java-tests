import { observer } from 'mobx-react';
import { useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Banner } from '@src-v2/components/banner';
import { TextButton } from '@src-v2/components/button-v2';
import { Dropdown } from '@src-v2/components/dropdown';
import { TextareaControl } from '@src-v2/components/forms/form-controls';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Strong } from '@src-v2/components/typography';
import { ActionModal } from '@src-v2/containers/modals/action-modal';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Provider } from '@src-v2/types/enums/provider';
import { StubAny } from '@src-v2/types/stub-any';

export const CommentActionItem = observer(
  ({ data, setModal, closeModal }: { data: StubAny; setModal: StubAny; closeModal: StubAny }) => {
    const handleCommentAction = useCommentActionHandler(data, setModal, closeModal);
    const { rbac } = useInject();

    return (
      <Dropdown.Item
        onClick={handleCommentAction}
        disabled={!rbac.canEdit(resourceTypes.RiskMiscellaneous)}>
        <SvgIcon name="Comment" />
        Add a comment
      </Dropdown.Item>
    );
  }
);

function useCommentActionHandler(data: StubAny, setModal: StubAny, closeModal: StubAny) {
  const { risks, toaster, session } = useInject();
  const trackAnalytics = useTrackAnalytics();
  const { actionBanner } = useCommentActionBanner(data);

  const handleSubmit = useCallback(
    async ({ Comment: comment }: { Comment: StubAny }) => {
      try {
        await risks.commentOnRisk({ comment, key: data.key });
        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.ActionType]: 'Comment on risk',
        });
        risks.modifyActionTimelineItem(data, {
          type: 'Comment',
          provider: 'Unresolved',
          createdBy: session.username,
          createdAt: new Date(),
          ...data,
        });
        toaster.success('Comment added successfully');
        closeModal();
      } catch (error) {
        toaster.error('Failed to add comment');
      }
    },
    [data, risks, trackAnalytics, session.username, toaster, closeModal]
  );

  return useCallback(() => {
    setModal(
      <ActionModal
        onSubmit={handleSubmit}
        title={
          <TitleContainer>
            <SvgIcon name="Comment" size={Size.XXLARGE} />
            Add a comment
          </TitleContainer>
        }
        submitText="Comment"
        onClose={closeModal}>
        <TextareaControl
          name="Comment"
          rules={{
            required: 'Please enter a comment before submitting',
            validate: value => value.trim() !== '' || 'Comment cannot be empty',
          }}
          charLimit={500}
        />
        {actionBanner}
      </ActionModal>
    );
  }, [data, handleSubmit, setModal, closeModal, actionBanner]);
}

function useCommentActionBanner(data: StubAny) {
  const { application } = useInject();

  const jiraIssuesLinkedToRisk = data.actionsTakenSummaries.filter(
    (action: StubAny) => action.type === 'Issue' && action.provider === Provider.Jira
  );

  const shouldShowJiraTicketsBanner =
    jiraIssuesLinkedToRisk.length > 0 &&
    application.isFeatureEnabled(FeatureFlag.Jira2WayIntegration);

  return {
    actionBanner: shouldShowJiraTicketsBanner ? <JiraTicketsWarningBanner /> : null,
  };
}

const JiraTicketsWarningBanner = () => {
  return (
    <BannerContainer>
      <SvgIcon name="Info" />
      <span>
        The comment <Strong>will also appear</Strong> in all linked Jira tickets
      </span>
      <TextButton to="/connectors/manage/Jira#TicketingSystems" showArrow="internal" underline>
        Change settings
      </TextButton>
    </BannerContainer>
  );
};

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem;

  ${BaseIcon} {
    color: var(--color-blue-gray-50);
  }
`;

const BannerContainer = styled(Banner)`
  gap: 0;
  margin: 0;
`;
