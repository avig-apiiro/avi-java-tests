import { useMemo, useRef, useState } from 'react';
import { ConfirmationModalHeader, ModalContainer } from '@src-v2/components/confirmation-modal';
import {
  Modal,
  ModalPresentationContext,
  ModalPresenter,
} from '@src-v2/components/modals/modal-presenter';

export function usePopupModalPresenter() {
  const [displayedModal, setDisplayedModal] = useState<any>(null);

  const [modalTitle, setModalTitle] = useState('');

  const dismissHandlerRef = useRef<() => void>(null);

  const popupModalPresenter = useMemo<ModalPresenter>(
    () => ({
      showModal<TModalInput, TModalOutput>(
        modalComponent: Modal<TModalInput, TModalOutput>,
        input: TModalInput
      ): Promise<TModalOutput> {
        dismissHandlerRef.current = () => setDisplayedModal(null);

        return new Promise<TModalOutput>(accept => {
          const Modal = modalComponent;

          const presentationContext: ModalPresentationContext<TModalOutput> = {
            setTitle(title) {
              setModalTitle(title);
            },

            requestClose(output: TModalOutput) {
              setDisplayedModal(null);
              accept(output);
            },

            setExternalDismissHandler(dismissHandler: () => boolean) {
              dismissHandlerRef.current = () => {
                if (!dismissHandler || dismissHandler()) {
                  setDisplayedModal(null);
                  accept(null);
                }
              };
            },
          };

          setDisplayedModal(<Modal modalInput={input} presentationContext={presentationContext} />);
        });
      },
    }),

    [setDisplayedModal, setModalTitle, dismissHandlerRef]
  );

  const popupModalPresenterElement = displayedModal && (
    <ModalContainer onClose={dismissHandlerRef.current}>
      <ConfirmationModalHeader title={modalTitle} onClose={dismissHandlerRef.current} />
      {displayedModal}
    </ModalContainer>
  );

  return {
    popupModalPresenterElement,
    popupModalPresenter,
  };
}
