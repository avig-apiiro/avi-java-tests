import { useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { SuccessToast } from '@src-v2/components/toastify';
import {
  ExternalLink,
  Heading2,
  Paragraph,
  SubHeading3,
  UnorderedList,
} from '@src-v2/components/typography';
import { useInject, useSuspense } from '@src-v2/hooks';
import { Provider } from '@src-v2/types/enums/provider';

export function LinkExistingTicketModal({ riskData, onSubmit, onClose, children, ...props }) {
  const { ticketingIssues, toaster } = useInject();
  const trackAnalytics = useTrackAnalytics();

  const projects = useSuspense(ticketingIssues.getMonitoredProjects, {
    provider: Provider.Jira,
    withCreateIssuesPermission: true,
  });

  const handleSubmit = useCallback(
    async ({ url }) => {
      try {
        const response = await ticketingIssues.linkExistingTicket({
          url,
          riskData,
          projects,
        });

        trackAnalytics(AnalyticsEventName.ActionInvoked, {
          [AnalyticsDataField.ActionType]: `Link existing ticket`,
        });

        onSubmit?.();
        toaster.success(
          <SuccessToast>
            Ticket linked successfully{' '}
            {response && <ExternalLink href={response}>View ticket</ExternalLink>}
          </SuccessToast>
        );

        onClose();
      } catch (error) {
        toaster.error(<ErrorToast provider={Provider.Jira} error={error} />);
      }
    },
    [riskData, onSubmit, onClose]
  );

  return (
    <LinkModal
      {...props}
      title={<SvgIcon name="IconLink" />}
      submitText="Link ticket"
      onSubmit={handleSubmit}
      onClose={onClose}>
      <SubHeader>
        <Heading2> Link existing ticket</Heading2>
        <SubHeading3> Add the URL of an existing ticket or issue </SubHeading3>
        <SubHeading3> to associate it with the risk </SubHeading3>
      </SubHeader>

      <Label required>Ticket URL</Label>
      <InputControl name="url" placeholder="Paste URL here" rules={{ required: true }} />
    </LinkModal>
  );
}

const ErrorToast = styled(({ provider, error, ...props }) => {
  return (
    <div {...props}>
      <Paragraph>Failed to link a Jira ticket to the issue.</Paragraph>
      <Paragraph>{error?.response?.data ?? 'please try again.'}</Paragraph>
    </div>
  );
})`
  ${Paragraph}, ${UnorderedList} {
    margin-bottom: 0;
  }
`;

const LinkModal = styled(ConfirmationModal)`
  ${Modal.Title} {
    display: flex;
    flex-direction: column;
  }
  ${Modal.Header} {
    padding-bottom: 2rem;
  }
  ${BaseIcon} {
    color: var(--color-blue-gray-50);
  }

  ${Heading2} {
    margin-bottom: 2rem;
  }

  ${Modal.Footer} {
    padding: 6rem;
  }
  ${Label} {
    margin-top: 8rem;
  }
`;

const SubHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
