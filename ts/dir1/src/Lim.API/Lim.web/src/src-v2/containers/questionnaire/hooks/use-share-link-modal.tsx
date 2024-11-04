import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Input } from '@src-v2/components/forms';
import { Paragraph } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const useShareLinkModal: (args: {
  title?: string;
  message?: string;
  submitText?: string;
  cancelText?: string;
  onClose?: () => void;
}) => {
  shareLinkModalElement: JSX.Element;
  showShareModal: (pathName: string) => void;
} = ({
  title = 'Share questionnaire',
  message = 'Share this link with feature owners to get their response',
  submitText = 'Copy link',
  cancelText = 'Cancel',
  onClose,
}) => {
  const [shareLinkModalElement, setModal, closeModal] = useModalState();

  const showShareModal = (pathName: string) => {
    setModal(
      <ShareLinkModal
        pathName={pathName}
        title={title}
        message={message}
        submitText={submitText}
        cancelText={cancelText}
        onClose={() => {
          onClose?.();
          closeModal();
        }}
      />
    );
  };
  return { showShareModal, shareLinkModalElement };
};

const ShareLinkModal = styled(
  ({ title, pathName, message, submitText, cancelText, onClose, ...props }) => {
    const { host, protocol } = window.location;

    const link = `${protocol}//${host}${pathName}`;
    const { toaster } = useInject();
    return (
      <ConfirmationModal
        {...props}
        title={title}
        submitText={submitText}
        cancelText={cancelText}
        onClose={onClose}
        onSubmit={() => {
          navigator.clipboard.writeText(`${protocol}//${host}${pathName}`).then(() => {
            toaster.success('Link copied to clipboard');
            onClose();
          });
        }}>
        <Paragraph>{message}</Paragraph>
        {/*@ts-ignore*/}
        <Input data-readonly value={link} />
      </ConfirmationModal>
    );
  }
)`
  ${Paragraph} {
    margin-bottom: 6rem;
  }
`;
