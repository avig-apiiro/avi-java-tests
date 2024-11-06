import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { Paragraph } from '@src-v2/components/typography';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const useKillSwitchModal: ({
  handleKillSwitchClick,
}: {
  handleKillSwitchClick: () => Promise<void>;
}) => [() => void, JSX.Element] = ({ handleKillSwitchClick }) => {
  const [deleteModalElement, setModal, closeModal] = useModalState();

  const showDeleteModal = () => {
    setModal(
      <DiscardModal
        title="Stop PR scans?"
        onSubmit={() => handleKillSwitchClick().then(closeModal)}
        submitText="Stop scans"
        onClose={closeModal}
        cancelText="Cancel">
        <Paragraph>
          This action stops and fails all active ADO scans, immediately releasing ADO resources.
          Future scans remain unaffected. <br />
          Are you sure you want to proceed?
        </Paragraph>
      </DiscardModal>
    );
  };
  return [showDeleteModal, deleteModalElement];
};
