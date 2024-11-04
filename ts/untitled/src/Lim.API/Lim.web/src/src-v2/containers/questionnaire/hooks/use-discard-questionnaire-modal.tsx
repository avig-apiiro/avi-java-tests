import { useCallback } from 'react';
import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { Paragraph } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { StubAny } from '@src-v2/types/stub-any';

export const useDiscardQuestionnaireModal = (id: string) => {
  const { questionnaires, toaster } = useInject();

  async function discardQuestionnaire() {
    await questionnaires.discard(id);
    closeModal();
  }

  const [modalElement, setModal, closeModal] = useModalState();
  const confirmDiscard = useCallback(() => {
    setModal(
      <DiscardModal
        title="Discard this questionnaire?"
        submitText="Discard"
        submitStatus="failure"
        onClose={closeModal}
        onSubmit={discardQuestionnaire}
        onError={(error: StubAny) => toaster.error(error)}>
        <Paragraph>
          Are you sure? After you discard a questionnaire, its answers can no longer be changed.
        </Paragraph>
      </DiscardModal>
    );
  }, [setModal, closeModal, id]);

  return [modalElement, confirmDiscard] as const;
};
