import { observer } from 'mobx-react';
import {
  BaseSyntheticEvent,
  ComponentType,
  HTMLProps,
  forwardRef,
  useCallback,
  useEffect,
} from 'react';
import {
  FieldErrors,
  FormProvider,
  FormState,
  Mode,
  SubmitHandler,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { UseFormProps } from 'react-hook-form/dist/types';
import { Form } from '@src-v2/components/forms/form-layout';
import { ModalRouteChangePrompt } from '@src-v2/containers/modals/route-prompt-message-modal';
import { FormProperties } from '@src-v2/data/form-properties';
import { useGroupProperties } from '@src-v2/hooks';

export const FormContext = forwardRef<
  HTMLFormElement,
  Omit<HTMLProps<HTMLFormElement>, 'onSubmit'> & {
    form?: ComponentType;
    defaultValues?: any;
    onSubmit: (formValues: any, event: BaseSyntheticEvent, formState: FormState<any>) => void;
    onError?: () => void;
    displayPromptOnLeave?: boolean;
    serverErrors?: FieldErrors;
    enableServerErrors?: boolean;
    mode?: Mode;
  } & Omit<UseFormProps, 'onSubmit'>
>(
  (
    {
      form: DefaultForm = Form,
      onSubmit,
      onError,
      displayPromptOnLeave = true,
      enableServerErrors,
      mode = 'onBlur',
      serverErrors,
      ...props
    },
    ref
  ) => {
    const [formProps, otherProps] = useGroupProperties(props, FormProperties);
    const { handleSubmit, control, ...methods } = useForm({
      ...formProps,
      mode,
      shouldUseNativeValidation: false,
    });

    useEffect(() => {
      if (enableServerErrors && serverErrors) {
        control._formState.errors = serverErrors;
        control._subjects.state.next({
          errors: control._formState.errors,
          isValid: false,
        });
      }
    }, [serverErrors]);

    const onSubmitWrapper = useCallback<SubmitHandler<any>>(
      (formValues, event) => onSubmit(formValues, event, methods.formState),
      [methods]
    );

    return (
      <FormProvider handleSubmit={handleSubmit} control={control} {...methods}>
        <DefaultForm
          {...otherProps}
          ref={ref}
          onSubmit={handleSubmit(onSubmitWrapper, onError as any)}>
          {props.children}
          {displayPromptOnLeave && <DirtyFormDiscardModalPrompt />}
        </DefaultForm>
      </FormProvider>
    );
  }
);

const DirtyFormDiscardModalPrompt = observer(() => {
  const {
    formState: { isDirty, isSubmitting },
  } = useFormContext();
  return (
    <ModalRouteChangePrompt title="Discard Changes?" when={isDirty && !isSubmitting}>
      There are changes that will be discarded.
      <br />
      Are you sure?
    </ModalRouteChangePrompt>
  );
});
