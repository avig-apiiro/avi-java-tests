import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Input } from '@src-v2/components/forms';
import { Paragraph } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks/use-inject';
import { useModalState } from '@src-v2/hooks/use-modal-state';

interface ShareLinkModalProps {
  title: string;
  message: string;
  submitText: string;
  cancelText: string;
  onClose: () => void;
  link: string;
}

export const useShareLinkModal: () => {
  shareLinkModalElement: JSX.Element;
  showShareModal: (pathName: string) => void;
} = (
  title = 'Share Link',
  message = 'Copy this link to share',
  submitText = 'Copy link',
  cancelText = 'Cancel'
) => {
  const [shareLinkModalElement, setModal, closeModal] = useModalState();

  const showShareModal = (link: string) => {
    setModal(
      <ShareLinkModal
        link={link}
        title={title}
        message={message}
        submitText={submitText}
        cancelText={cancelText}
        onClose={closeModal}
      />
    );
  };
  return { showShareModal, shareLinkModalElement };
};

const ShareLinkModal = styled(
  ({ title, message, submitText, cancelText, onClose, link, ...props }: ShareLinkModalProps) => {
    const { toaster } = useInject();
    return (
      <ConfirmationModal
        {...props}
        title={title}
        submitText={submitText}
        cancelText={cancelText}
        onClose={onClose}
        onSubmit={() => {
          navigator.clipboard.writeText(link).then(() => {
            toaster.success('Link copied to clipboard');
            onClose();
          });
        }}>
        <Paragraph>{message}</Paragraph>

        <Input data-readonly value={link} />
      </ConfirmationModal>
    );
  }
)`
  ${Paragraph} {
    margin-bottom: 6rem;
  }
`;
