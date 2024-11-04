import { useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { ElementSeparator } from '@src-v2/components/element-separator';
import { BaseIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading4, Paragraph, SubHeading4 } from '@src-v2/components/typography';
import { HelpModalButton } from '@src-v2/containers/modals/help-modal';
import { useInject } from '@src-v2/hooks';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';

export const ComingSoonModal = ({
  closeModal,
  provider,
}: {
  provider: ProviderGroup;
  closeModal: () => void;
}) => {
  const { toaster } = useInject();
  const trackAnalytics = useTrackAnalytics();
  const handleClick = useCallback(() => {
    try {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Let me know',
        [AnalyticsDataField.ConnectorName]: provider.displayName,
      });
      toaster.success('Your request successfully sent!');
    } catch {
      toaster.error(
        <ErrorToast>
          Unfortunately, the request was not sent <HelpModalButton label="Suupport" />
        </ErrorToast>
      );
    } finally {
      closeModal();
    }
  }, []);

  return (
    <ConfirmationModal
      title={
        <ComingSoonHeader>
          <SvgIcon size={Size.XXLARGE} name="Announce" />
          Coming soon!
        </ComingSoonHeader>
      }
      submitText="Let me know"
      onSubmit={handleClick}
      onClose={closeModal}>
      <ModalContentWrapper>
        <ModalHeader>
          <span>
            <VendorIcon size={Size.LARGE} name={provider.iconName || provider.key} />
            <Heading4>{provider.displayName || provider.key}</Heading4>
          </span>
          <ElementSeparator as={SubHeading4}>
            {!provider.premiseOnly && 'Cloud'}
            {!provider.cloudOnly && 'On premises'}
          </ElementSeparator>
        </ModalHeader>
        <Paragraph>
          Something brilliant is coming <SvgIcon size={Size.XSMALL} name="Diamond" /> <br /> Our
          newest integration is in the works, and we can't wait to share it with you. This
          integration is still in its early stages, undergoing its final polish to bring dazzling
          new functionality to the ASPM you know and love. Be the first to know when it's ready.
        </Paragraph>
      </ModalContentWrapper>
    </ConfirmationModal>
  );
};

const ErrorToast = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10rem;
`;

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
`;

const ComingSoonHeader = styled.div`
  display: flex;
  gap: 3rem;
  align-items: center;

  ${BaseIcon} {
    color: var(--color-blue-gray-60);
  }
`;
