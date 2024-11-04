import { useCallback, useState } from 'react';

export function useModalState() {
  const [modalElement, setModalElement] = useState<JSX.Element>();
  return [
    modalElement ?? null,
    setModalElement,
    useCallback(() => setModalElement(null), [setModalElement]),
  ] as const;
}
