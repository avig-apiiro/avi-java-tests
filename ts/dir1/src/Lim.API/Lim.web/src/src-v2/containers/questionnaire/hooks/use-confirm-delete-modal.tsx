import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { Paragraph } from '@src-v2/components/typography';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const useConfirmDeleteModal: ({
  title,
  message,
  submitText,
  cancelText,
  handleDelete,
}: {
  title?: string;
  message?: string;
  submitText?: string;
  cancelText?: string;
  handleDelete: () => void;
}) => [() => void, JSX.Element] = ({
  title = 'Discard this question?',
  message = 'Are you sure?',
  submitText = 'Delete',
  cancelText = 'Cancel',
  handleDelete,
}) => {
  const [deleteModalElement, setModal, closeModal] = useModalState();

  const showDeleteModal = () => {
    setModal(
      <DiscardModal
        title={title}
        onSubmit={handleDelete}
        submitText={submitText}
        onClose={closeModal}
        cancelText={cancelText}>
        <Paragraph>{message}</Paragraph>
      </DiscardModal>
    );
  };
  return [showDeleteModal, deleteModalElement];
};
