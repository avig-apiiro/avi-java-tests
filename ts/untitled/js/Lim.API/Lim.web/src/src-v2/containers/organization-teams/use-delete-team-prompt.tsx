import { useCallback } from 'react';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export function useDeleteTeamPrompt() {
  const { orgTeamProfiles } = useInject();
  const [modal, setModal, closeModal] = useModalState();

  const handleDelete = useCallback(
    ({ key, name }: { key: string; name: string }, onDelete?: () => void) => {
      setModal(
        <ConfirmationModal
          title={`Delete ${name}?`}
          submitStatus="failure"
          submitText="Delete"
          onClose={closeModal}
          onSubmit={submitDelete}>
          Are you sure you want to delete this team?
        </ConfirmationModal>
      );

      async function submitDelete() {
        await orgTeamProfiles.deleteProfile({ key });
        onDelete?.();
      }
    },
    [closeModal]
  );

  return [modal, handleDelete] as const;
}
