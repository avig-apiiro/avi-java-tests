import { ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { BaseIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading1 } from '@src-v2/components/typography';
import { NewFeedbackModal, Status } from '@src-v2/containers/modals/new-feedback-modal';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { FeedbackContext } from '@src-v2/services';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { CircleButton } from './button-v2/circle-button';

const PoweredByDefault = () => (
  <>
    Powered by ApiiroAI and OpenAI GPT-4 <VendorIcon size={Size.XXSMALL} name="OpenAIGPT" />
  </>
);

export const Feedback = ({
  poweredBy = <PoweredByDefault />,
  context,
}: {
  context?: FeedbackContext;
  poweredBy?: ReactNode;
}) => {
  const { toaster, feedback } = useInject();

  const [modalElement, setModal, closeModal] = useModalState();
  const response = useSuspense(feedback.getFeedback, context);
  const [feedbackData, setFeedbackData] = useState<{
    sentiment: Status;
    key: string;
  }>(response.feedback);

  const handleRemoveFeedback = useCallback(async () => {
    try {
      await feedback.deleteFeedback(feedbackData?.key);
      setFeedbackData({ key: feedbackData?.key, sentiment: null });
      toaster.success('Feedback removed');
    } catch (error) {
      toaster.error('Failed to remove feedback');
    } finally {
      closeModal();
    }
  }, [toaster, closeModal, feedbackData]);

  const handleClick = useCallback(
    async (event, status) => {
      if (status === feedbackData?.sentiment) {
        setModal(
          <ConfirmationModal
            title={<Heading1>Remove submitted feedback?</Heading1>}
            submitText="Remove"
            onSubmit={handleRemoveFeedback}
            onClose={closeModal}>
            <>This will remove the feedback you submitted for the section.</>
          </ConfirmationModal>
        );
        stopPropagation(event);
        return;
      }

      setModal(
        <NewFeedbackModal
          onClose={closeModal}
          status={status}
          context={context}
          sentiment={feedbackData?.sentiment}
        />
      );

      const { key } = await feedback.createNewFeedback({
        context,
        sentiment: status,
      });

      setFeedbackData({ key, sentiment: status });
      stopPropagation(event);
    },
    [feedbackData]
  );

  return (
    <FeedbackContainer>
      <PoweredBy>{poweredBy}</PoweredBy>
      <IsThisHelpful>
        Is this helpful?
        <FeedbackButtonWrapper>
          <CircleButton
            data-status={feedbackData?.sentiment === Status.Positive && Status.Positive}
            onClick={event => handleClick(event, Status.Positive)}
            variant={Variant.TERTIARY}
            size={Size.XSMALL}>
            <SvgIcon name="Like" size={Size.XXSMALL} />
          </CircleButton>
          <CircleButton
            data-status={feedbackData?.sentiment === Status.Negative && Status.Negative}
            onClick={event => handleClick(event, Status.Negative)}
            variant={Variant.TERTIARY}
            size={Size.XSMALL}>
            <SvgIcon name="Dislike" size={Size.XXSMALL} />
          </CircleButton>
        </FeedbackButtonWrapper>
      </IsThisHelpful>
      {modalElement}
    </FeedbackContainer>
  );
};

const PoweredBy = styled.span`
  display: flex;
  gap: 1rem;
  align-items: center;
  color: var(--color-blue-gray-60);
`;

const FeedbackContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  justify-content: space-between;

  [data-status=${Status.Positive}] {
    &:not([data-disabled]) {
      &:hover {
        ${BaseIcon} {
          color: var(--color-green-55);
        }
      }
    }

    ${BaseIcon} {
      color: var(--color-green-55);
    }
  }

  [data-status=${Status.Negative}] {
    &:not([data-disabled]) {
      &:hover {
        ${BaseIcon} {
          color: var(--color-red-50);
        }
      }
    }

    ${BaseIcon} {
      color: var(--color-red-50);
    }
  }
`;

const IsThisHelpful = styled.span`
  display: flex;
  gap: 2rem;
  align-items: center;
  color: var(--color-blue-gray-60);
`;

const FeedbackButtonWrapper = styled.div`
  display: flex;
`;
