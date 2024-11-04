import { useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Modal as ModalComponent } from '@src-v2/components/modals';
import { Modal } from '@src-v2/components/modals/modal-presenter';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';

export type AlertMessageModalInput = {
  title: string;
  prompt: string;
  options: {
    caption: string;
    buttonVariant: Variant;
    returnValue: string;
  }[];
  inhibitCancel?: boolean;
};

export const AlertMessageModal: Modal<AlertMessageModalInput, string> = ({
  modalInput,
  presentationContext,
}) => {
  useEffect(() => {
    presentationContext.setTitle(modalInput.title);
    if (!modalInput.inhibitCancel) {
      presentationContext.setExternalDismissHandler(() => true);
    }
  });
  return (
    <>
      <ModalComponent.Content>{modalInput.prompt}</ModalComponent.Content>
      <ModalComponent.Footer>
        <ActionsWrapper>
          {!modalInput.inhibitCancel && (
            <Button
              onClick={() => presentationContext.requestClose(null)}
              variant={Variant.TERTIARY}
              size={Size.LARGE}>
              Cancel
            </Button>
          )}

          {modalInput.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => presentationContext.requestClose(option.returnValue)}
              variant={option.buttonVariant}
              size={Size.LARGE}>
              {option.caption}
            </Button>
          ))}
        </ActionsWrapper>
      </ModalComponent.Footer>
    </>
  );
};

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
