import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  Modal,
  ModalPresentationContext,
  ModalPresenter,
} from '@src-v2/components/modals/modal-presenter';
import { BreadcrumbProps, useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { dataAttr } from '@src-v2/utils/dom-utils';

const PageModalPresenterContext = createContext<ModalPresenter>(null);

export function usePageModalPresenter() {
  return useContext(PageModalPresenterContext);
}

type PresentedModal = {
  element: React.ReactNode;
  title: string;
  externalDismissHandler: () => void;
};

export function PageModalPresenter({ children }: { children: React.ReactNode }) {
  const [modalStack, setModalStack] = useState<PresentedModal[]>([]);

  const location = useLocation();
  useEffect(() => {
    setModalStack([]);
  }, [location]);

  const presenterInterface: ModalPresenter = useMemo(
    () => ({
      showModal<TModalInput, TModalOutput>(
        ModalComponent: Modal<TModalInput, TModalOutput>,
        modalInput: TModalInput
      ): Promise<TModalOutput> {
        return new Promise<TModalOutput>((accept, _) => {
          const presentedModal: PresentedModal = {
            element: null,
            externalDismissHandler: null,
            title: null,
          };

          const updatedPresentedModal = (newPresentedModal: Partial<PresentedModal>) => {
            setModalStack(modalStack => {
              Object.assign(presentedModal, newPresentedModal);
              return [...modalStack];
            });
          };

          const modalPresentationContext: ModalPresentationContext<TModalOutput> = {
            requestClose(result: TModalOutput) {
              setModalStack(modalStack => modalStack.filter(c => c !== presentedModal));
              accept(result);
            },

            setExternalDismissHandler(dismissHandler: () => boolean) {
              updatedPresentedModal({ externalDismissHandler: dismissHandler });
            },

            setTitle(title: string) {
              updatedPresentedModal({ title });
            },
          };

          presentedModal.element = (
            <ModalComponent
              presentationContext={modalPresentationContext}
              modalInput={modalInput}
            />
          );

          setModalStack(modalStack => [...modalStack, presentedModal]);
        });
      },
    }),
    [setModalStack]
  );

  const breadcrumbs: BreadcrumbProps[] = useMemo(
    () =>
      modalStack.length
        ? modalStack.map(presentedModal => ({
            label: presentedModal.title,
            to: '#',
            onPop: () => {
              presentedModal.externalDismissHandler?.();

              setModalStack(currentModalStack =>
                currentModalStack.filter(
                  stackPresentedModal => stackPresentedModal !== presentedModal
                )
              );

              return true;
            },
          }))
        : null,
    [modalStack]
  );

  useBreadcrumbs({
    breadcrumbs,
  });

  return (
    <PageModalPresenterContext.Provider value={presenterInterface}>
      <PageModalLayer data-visible={dataAttr(!modalStack.length)}>{children}</PageModalLayer>
      {modalStack.map((presentedModal, index, modals) => (
        <PageModalLayer data-visible={dataAttr(index === modals.length - 1)} key={index}>
          {presentedModal.element}
        </PageModalLayer>
      ))}
    </PageModalPresenterContext.Provider>
  );
}

const PageModalLayer = styled.div`
  position: absolute;
  width: 100%;
  min-width: 100%;
  display: none;

  &[data-visible] {
    display: block;
  }
`;
