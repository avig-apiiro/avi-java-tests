import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { Paragraph } from '@src-v2/components/typography';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const useConfirmWorkflowDeleteModal: ({
  handleDeleteWorkflow,
}: {
  handleDeleteWorkflow: (workflow: { key: string }) => void;
}) => readonly [(workflow: { key: string }) => void, JSX.Element] = ({ handleDeleteWorkflow }) => {
  const [deleteModalElement, setModal, closeModal] = useModalState();

  const showDeleteModal = (workflow: { key: string }) => {
    setModal(
      <DiscardModal
        title="Delete this workflow?"
        onSubmit={() => {
          handleDeleteWorkflow(workflow);
          closeModal();
        }}
        submitText="Delete"
        onClose={closeModal}>
        <Paragraph>Are you sure?</Paragraph>
      </DiscardModal>
    );
  };
  return [showDeleteModal, deleteModalElement] as const;
};
