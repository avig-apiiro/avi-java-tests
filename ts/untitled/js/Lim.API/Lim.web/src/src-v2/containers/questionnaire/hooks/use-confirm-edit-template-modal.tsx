import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Paragraph } from '@src-v2/components/typography';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { StubAny } from '@src-v2/types/stub-any';

export const useConfirmEditTemplateModal = () => {
  const [modalElement, setModal, closeModal] = useModalState();

  const showModal = ({
    handleSubmit,
    handleCancel,
  }: {
    handleSubmit: StubAny;
    handleCancel: StubAny;
  }) => {
    setModal(
      <ConfirmationModal
        onError={null}
        title="Edit a template"
        onSubmit={() => {
          handleSubmit();
          closeModal();
        }}
        submitText="Save changes"
        onClose={() => {
          handleCancel();
          closeModal();
        }}
        cancelText="Cancel">
        <Paragraph>
          Are you sure?
          <br /> Editing this template will not apply your changes to active questionnaires.
        </Paragraph>
      </ConfirmationModal>
    );
  };
  return [showModal, modalElement] as const;
};
