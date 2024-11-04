import { useCallback } from 'react';
import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { BaseIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink } from '@src-v2/components/typography';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';

export const ManagedModal = ({
  closeModal,
  apiLink,
  learnMoreLink,
  modalContent,
  provider,
}: {
  provider: ProviderGroup;
  closeModal: () => void;
  apiLink: string;
  learnMoreLink: string;
  modalContent: string;
}) => {
  const handleClick = useCallback(() => {
    window.open(apiLink, '_blank', 'noopener,noreferrer');
    closeModal();
  }, []);

  return (
    <ConfirmationModal
      title={
        <ManagedHeader>
          <VendorIcon size={Size.XXLARGE} name={provider.iconName} />
          Connect Managed Semgrep
        </ManagedHeader>
      }
      submitText={provider.connected ? 'Manage via API' : 'Connect via API'}
      onSubmit={handleClick}
      onClose={closeModal}>
      <ModalContentWrapper>
        <span>{modalContent}</span>
        <ExternalLink href={learnMoreLink}>Learn more in Apiiro docs</ExternalLink>
      </ModalContentWrapper>
    </ConfirmationModal>
  );
};

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  font-size: var(--font-size-s);
`;

const ManagedHeader = styled.div`
  display: flex;
  gap: 3rem;
  align-items: center;

  ${BaseIcon} {
    color: var(--color-blue-gray-60);
  }
`;
