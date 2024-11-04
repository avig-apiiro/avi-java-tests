import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { Paragraph } from '@src-v2/components/typography';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const useDeleteCustomReportModal: ({
  handleDeleteReport,
}: {
  handleDeleteReport: () => void;
}) => readonly [() => void, JSX.Element] = ({ handleDeleteReport }) => {
  const [deleteModalElement, setModal, closeModal] = useModalState();

  const showDeleteModal = () => {
    setModal(
      <DiscardModal
        title="Delete this report?"
        onSubmit={() => {
          handleDeleteReport();
          closeModal();
        }}
        submitText="Delete"
        onClose={closeModal}>
        <Paragraph>This action will permanenntly delete this report. Are you sure?</Paragraph>
      </DiscardModal>
    );
  };
  return [showDeleteModal, deleteModalElement] as const;
};
