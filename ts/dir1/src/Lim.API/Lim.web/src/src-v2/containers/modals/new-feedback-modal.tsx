import _ from 'lodash';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Banner, InfoBanner } from '@src-v2/components/banner';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { CheckboxControl, TextareaControl } from '@src-v2/components/forms/form-controls';
import { Field } from '@src-v2/components/forms/modal-form-layout';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading2, SubHeading3 } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { FeedbackObject } from '@src-v2/services';

type ModalSection = {
  header: string;
  subHeader: string;
  checkboxes: {
    key: string;
    label: string;
  }[];
  icon: string;
};

type ModalStatus = {
  Positive: ModalSection;
  Negative: ModalSection;
};

export enum Status {
  Positive = 'Positive',
  Negative = 'Negative',
}

const ModalStatusData: ModalStatus = {
  Positive: {
    header: 'Provide additional feedback',
    subHeader: 'What did you find helpful about this information?',
    checkboxes: [
      { key: 'easyToUnderstand', label: 'Easy to understand' },
      { key: 'usefulContent', label: 'Useful content' },
      { key: 'relevantToMyNeeds', label: 'Relevant to my needs' },
    ],
    icon: 'Like',
  },
  Negative: {
    header: 'Provide additional feedback',
    subHeader: 'What issues did you find with this information?',
    checkboxes: [
      { key: 'inaccurateInformation', label: 'Inaccurate information' },
      { key: 'incompleteInformation', label: 'Incomplete information' },
      { key: 'tooTechnical', label: 'Too technical' },
    ],
    icon: 'Dislike',
  },
};

const NewFeedbackHeader = ({ status }: { status: Status }) => {
  const currentStatus = ModalStatusData[status];
  return (
    <HeaderWrapper data-status={status}>
      <SvgIcon name={currentStatus.icon} size={Size.XXLARGE} />
      <Heading2>{currentStatus.header}</Heading2>
      <SubHeading3>{currentStatus.subHeader}</SubHeading3>
    </HeaderWrapper>
  );
};

export function NewFeedbackModal({
  onClose,
  onSubmit,
  status = Status.Positive,
  context,
  sentiment,
  ...props
}: {
  onClose: any;
  onSubmit?: () => void;
  status: Status;
  sentiment: Status;
  context?: any;
}) {
  const { toaster, feedback } = useInject();
  const data = ModalStatusData[status];
  const isFeedbackChanged = sentiment && sentiment !== status;

  const convertDataToSend = useCallback(
    (formData: Record<string, boolean> & { freeText: string }): FeedbackObject => {
      return {
        sentiment: status,
        selectedReasons: _.pickBy(formData, _.isBoolean),
        freeText: formData.freeText,
        context,
      };
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    onClose?.();
    toaster.success('Thanks for your feedback!', {
      icon: <SvgIcon name="RewardClapsHand" />,
    });
  }, [toaster, onClose]);

  const handleRequest = useCallback(
    async (formData: Record<string, boolean> & { freeText: string }) => {
      try {
        const dataToSend = convertDataToSend(formData);
        await feedback.createNewFeedback(dataToSend);
        onSubmit?.();
        toaster.success('Thanks for your feedback!', {
          icon: <SvgIcon name="RewardClapsHand" />,
        });
      } catch (error) {
        toaster.error('Something went wrong');
      } finally {
        onClose?.();
      }
    },
    [toaster, onClose, onSubmit]
  );

  return (
    <ModalContainer
      {...props}
      title={<NewFeedbackHeader status={status} />}
      onClose={handleCloseModal}
      submitText="Submit"
      cancelText="Skip"
      onSubmit={handleRequest}>
      <CheckboxesWrapper>
        {data.checkboxes.map(checkbox => (
          <CheckboxWrapper key={checkbox.key}>
            <CheckboxControl name={checkbox.key} defaultValue={false} />
            <span>{checkbox.label}</span>
          </CheckboxWrapper>
        ))}
      </CheckboxesWrapper>
      <Field>
        <TextareaControl
          name="freeText"
          placeholder="Add further feedback... (optional)"
          rows={5}
          charLimit={500}
        />
      </Field>
      {isFeedbackChanged && (
        <InfoBannerWrapper description="Submitting this feedback removes your previous response" />
      )}
    </ModalContainer>
  );
}

const ModalContainer = styled(ConfirmationModal)`
  width: 135rem;

  ${Modal.Title} {
    justify-content: center;
    margin-top: 8rem;
  }

  ${Modal.Header} {
    padding-bottom: 0;
    align-items: flex-start;
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  gap: 2rem;
  align-items: center;
  cursor: pointer;

  &[data-disabled] {
    cursor: default;
  }

  span {
    font-size: var(--font-size-s);
    color: var(--color-blue-gray-70);
  }
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  ${BaseIcon} {
    margin-bottom: 2rem;
  }

  &[data-status=${Status.Positive}] ${BaseIcon} {
    color: var(--color-green-55);
  }

  &[data-status=${Status.Negative}] ${BaseIcon} {
    color: var(--color-red-50);
  }
`;

const CheckboxesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 8rem 0;
`;

const InfoBannerWrapper = styled(InfoBanner)`
  ${Banner.Actions} {
    font-size: var(--font-size-s);
  }
`;
