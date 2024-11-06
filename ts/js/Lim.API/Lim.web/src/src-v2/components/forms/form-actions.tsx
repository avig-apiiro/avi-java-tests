import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';

export const FormActions = ({
  onCancel,
  submitText = 'Save',
  cancelText = 'Cancel',
  submitEnabled = true,
  cancelEnabled = true,
  allowSubmitNonDirty = false,
}) => {
  const {
    formState: { isDirty },
  } = useFormContext();

  return (
    <>
      {onCancel && (
        <Button
          size={Size.LARGE}
          variant={Variant.SECONDARY}
          disabled={!cancelEnabled}
          onClick={onCancel}>
          {cancelText}
        </Button>
      )}
      <Button
        size={Size.LARGE}
        variant={Variant.PRIMARY}
        disabled={!submitEnabled || (!isDirty && !allowSubmitNonDirty)}
        type="submit">
        {submitText}
      </Button>
    </>
  );
};

export const DiscardModal = styled(props => (
  <ConfirmationModal {...props} submitStatus="failure" />
))``;
