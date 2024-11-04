import { useCallback } from 'react';
import { TextButton } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { RemediationStep } from '@src-v2/components/entity-pane/remediation/remediation-steps';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { CardTitle } from '@src-v2/components/panes/pane-body';
import { Paragraph, UnorderedList } from '@src-v2/components/typography';
import { useMessagingActionHandlers } from '@src-v2/containers/risks/actions/messaging-action-items';
import { useTicketingActionItems } from '@src-v2/containers/risks/actions/ticketing-action-items';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { humanize } from '@src-v2/utils/string-utils';

export function WhatToDoCard() {
  const { risk } = useEntityPaneContext();
  const [modalElement, setModal, closeModal] = useModalState();
  const { messagingVendor, ticketingVendor } = useCallToActionVendors();

  const { handleSendSlackMessage, handleSendTeamsMessage, handleSendGoogleChatMessage } =
    useMessagingActionHandlers(risk, setModal, closeModal);

  const { handleCreateJiraIssue, handleCreateGithubIssue, handleCreateAzureDevopsIssue } =
    useTicketingActionItems(risk, setModal, closeModal);

  const handleCreateIssue = useCallback(() => {
    switch (ticketingVendor) {
      case 'Jira':
        return handleCreateJiraIssue();
      case 'Github':
        return handleCreateGithubIssue();
      case 'AzureDevops':
        return handleCreateAzureDevopsIssue();
      default:
        console.error(`Unsupported action modal for vendor "${ticketingVendor}"`);
    }
  }, [ticketingVendor]);

  const handleSendMessage = useCallback(() => {
    switch (messagingVendor) {
      case 'Slack':
        return handleSendSlackMessage();
      case 'GoogleChat':
        return handleSendGoogleChatMessage();
      case 'Teams':
        return handleSendTeamsMessage();
      default:
        console.error(`Unsupported action modal for vendor "${messagingVendor}"`);
    }
  }, [messagingVendor]);

  return (
    <Card>
      <CardTitle>What should I do?</CardTitle>
      <Paragraph>Here are your main recommended possibilities:</Paragraph>
      <UnorderedList>
        {ticketingVendor && (
          <RemediationStep bullet={<VendorIcon name={ticketingVendor} />}>
            <TextButton onClick={handleCreateIssue} underline>
              Create a {humanize(ticketingVendor)} issue
            </TextButton>
            {Boolean(risk.codeOwner) && (
              <>
                {' '}
                assigned to{' '}
                <TextButton to={`/users/contributors/${risk.codeOwner.identityKey}`} underline>
                  {risk.codeOwner.username}
                </TextButton>
              </>
            )}
          </RemediationStep>
        )}

        {messagingVendor && (
          <RemediationStep bullet={<VendorIcon name={messagingVendor} />}>
            <TextButton onClick={handleSendMessage} underline>
              Send a {humanize(messagingVendor)} message
            </TextButton>
          </RemediationStep>
        )}

        <RemediationStep bullet={<SvgIcon name="Workflow" />}>
          <TextButton to="/workflows" underline>
            Create a workflow
          </TextButton>{' '}
          to alert and prevent future risks
        </RemediationStep>
      </UnorderedList>

      {modalElement}
    </Card>
  );
}

function useCallToActionVendors(): { messagingVendor: string; ticketingVendor: string } {
  const {
    application: { integrations },
  } = useInject();

  const messagingVendor = integrations.connectedToSlack
    ? 'Slack'
    : integrations.connectedToGoogleChat
      ? 'GoogleChat'
      : integrations.connectedToTeams
        ? 'Teams'
        : null;
  const ticketingVendor = integrations.connectedToJira
    ? 'Jira'
    : integrations.connectedToGithub
      ? 'Github'
      : integrations.connectedToAzureDevops
        ? 'AzureDevops'
        : null;

  return {
    messagingVendor,
    ticketingVendor,
  };
}
