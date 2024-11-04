import React from 'react';

export interface ModalPresentationContext<TModalOutput> {
  requestClose(output: TModalOutput): void;

  setTitle(title: string): void;

  setExternalDismissHandler(dismissHandler: () => boolean): void;
}

export type Modal<TModalInput, TModalOutput> = React.FC<{
  presentationContext: ModalPresentationContext<TModalOutput>;
  modalInput: TModalInput;
}>;

export interface ModalPresenter {
  showModal<TModalInput, TModalOutput>(
    modalComponent: Modal<TModalInput, TModalOutput>,
    input: TModalInput
  ): Promise<TModalOutput>;
}
