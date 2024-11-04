import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Prompt, useHistory } from 'react-router-dom';
import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { StubAny } from '@src-v2/types/stub-any';

type RouteChangePromptProps = { children: ReactNode; title?: string; when: boolean };

export function ModalRouteChangePrompt({
  children,
  title = 'Leaving so soon?',
  when,
}: RouteChangePromptProps) {
  const [promptStage, setPromptStage] = useState('none');
  const [pendingLocation, setPendingLocation] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const handleBeforeUnload = (event: StubAny) => {
      if (when) {
        event.preventDefault(); // intercept page reload events as well
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when]);

  const handleRoutePromptMessage = useCallback(
    (location: StubAny) => {
      if (promptStage === 'confirmed' || location.pathname === history.location.pathname) {
        return true;
      }

      setPendingLocation(location);
      setPromptStage('prompt');
      return false;
    },
    [promptStage, history]
  );

  const handleConfirmModal = useCallback(() => {
    setPromptStage('confirmed');
    if (pendingLocation) {
      history.push(pendingLocation);
      setPendingLocation(null);
    }
  }, [setPromptStage, pendingLocation, setPendingLocation]);

  const handleCancelModal = useCallback(() => {
    setPendingLocation(null);
    setPromptStage('none');
  }, [setPendingLocation, setPromptStage]);

  return (
    <>
      {promptStage === 'prompt' && (
        <DiscardModal
          title={title}
          onSubmit={handleConfirmModal}
          onClose={handleCancelModal}
          submitText="Discard">
          {children}
        </DiscardModal>
      )}
      <Prompt message={handleRoutePromptMessage} when={when} />
    </>
  );
}
