import { useCallback } from 'react';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const useDuplicateTemplateModal = ({ id, title }: { id: string; title: string }) => {
  const { questionnaires, toaster } = useInject();

  async function duplicateTemplate({ newTitle }: { newTitle: string }) {
    await questionnaires.duplicateTemplate(id, newTitle);
    closeModal();
    toaster.success('Duplicated successfully');
  }

  const [modalElement, setModal, closeModal] = useModalState();
  const confirmDiscard = useCallback(() => {
    setModal(
      <ConfirmationModal
        title="Duplicate template"
        submitText="Duplicate"
        onClose={closeModal}
        onSubmit={duplicateTemplate}
        onError={error => toaster.error(error)}>
        <>
          <Label required>Type a name</Label>
          <InputControl name="newTitle" defaultValue={`${title} (1)`} />
        </>
      </ConfirmationModal>
    );
  }, [setModal, closeModal, id]);

  return [modalElement, confirmDiscard] as const;
};
