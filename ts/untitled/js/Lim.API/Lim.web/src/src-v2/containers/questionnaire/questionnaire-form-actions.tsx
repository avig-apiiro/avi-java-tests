import { useFormContext } from 'react-hook-form';
import { FormActions } from '@src-v2/components/forms/form-actions';
import { StickyHeader } from '@src-v2/components/layout';
import { ModalRouteChangePrompt } from '@src-v2/containers/modals/route-prompt-message-modal';
import { StubAny } from '@src-v2/types/stub-any';

export const QuestionnaireFormActions = ({ formSubmitted }: { formSubmitted: StubAny }) => {
  const {
    formState: { isDirty },
  } = useFormContext();
  return (
    <>
      <StickyHeader.Content>
        <StickyHeader.Actions>
          <FormActions
            submitText="Submit answers"
            cancelText="Clear my answers"
            submitEnabled={isDirty}
            cancelEnabled={isDirty}
            onCancel={() => window.location.reload()}
          />
        </StickyHeader.Actions>
      </StickyHeader.Content>
      <ModalRouteChangePrompt title="Discard Changes?" when={isDirty && !formSubmitted}>
        hello
        <br />
        Are you sure?
      </ModalRouteChangePrompt>
    </>
  );
};
