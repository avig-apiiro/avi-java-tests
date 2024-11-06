import axios from 'axios';
import _ from 'lodash';
import { ComponentProps, FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { UseFormReturn } from 'react-hook-form/dist/types';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Button, CircleButton } from '@src-v2/components/button-v2';
import { IconButton } from '@src-v2/components/buttons';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { FormProperties } from '@src-v2/data/form-properties';
import { useGroupProperties, useToggle } from '@src-v2/hooks';
import { useCombineCallbacks } from '@src-v2/hooks/use-combine-callbacks';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const SubmitSeverityState = {
  warn: 'WARN',
  error: 'ERROR',
};

type CustomButton = {
  type: string;
  text: string;
  disabled: boolean;
  onClick: () => void;
};

type ConfirmationModalHeaderProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
};

export type OnSubmitFunction<T = any> = (
  formValues: T,
  formContext: Omit<UseFormReturn<T>, 'handleSubmit'>
) => Promise<void> | void;

type ConfirmationModalProps = {
  as?: FC<ComponentProps<'form'>>;
  submitText?: string;
  cancelText?: string;
  submitStatus?: 'primary' | 'failure';
  showFooter?: boolean;
  confirmOnClose?: boolean;
  disabledSubmitButton?: boolean;
  customButtonProps?: CustomButton;
  onSubmit: OnSubmitFunction;
  onError?: (e: any) => void;
  children: ReactNode;
  defaultValues?: any;
  props?: {
    [x: string]: any;
  };
} & ConfirmationModalHeaderProps;

export const ConfirmationModal = ({
  as: FormComponent = Form,
  title,
  subtitle,
  submitText = 'Confirm',
  cancelText = 'Cancel',
  submitStatus = 'primary',
  showFooter = true,
  confirmOnClose = false,
  disabledSubmitButton = false,
  customButtonProps = null,
  onSubmit,
  onError = null,
  onClose,
  children,
  ...props
}: ConfirmationModalProps) => {
  const [closeClicked, toggleCloseClicked] = useToggle();
  const [submitError, setSubmitError] = useState<{
    message: any;
    severity: keyof typeof SubmitSeverityState;
  }>();
  const [formProps, modalProps] = useGroupProperties(props, FormProperties);
  const { handleSubmit, ...methods } = useForm({ ...formProps, mode: 'onBlur' });

  const customButton = useMemo(() => {
    return (
      <Button
        variant={customButtonProps?.type === Variant.PRIMARY ? Variant.PRIMARY : Variant.SECONDARY}
        key={customButtonProps?.text}
        disabled={customButtonProps?.disabled}
        onClick={customButtonProps?.onClick}>
        {customButtonProps?.text}
      </Button>
    );
  }, [customButtonProps]);

  const handleClose = useCombineCallbacks(
    stopPropagation,
    useCallback(() => {
      if (submitError) {
        setSubmitError(null);
        return;
      }

      if (confirmOnClose && !closeClicked && methods.formState.isDirty) {
        toggleCloseClicked();
        return;
      }

      onClose();
    }, [confirmOnClose, submitError, closeClicked, methods.formState.isDirty, onClose])
  );

  const innerHandleSubmit = useCallback(
    async (formValues: any) => {
      try {
        await onSubmit(formValues, methods);
      } catch (error) {
        let message = error?.message ?? error;
        if (
          axios.isAxiosError(error) &&
          _.isString(error.response?.data) &&
          error.response?.data?.length > 0
        ) {
          message = error.response.data;
        }
        setSubmitError(error?.severity ? error : { message, severity: SubmitSeverityState.error });
      }
    },
    [onSubmit, methods]
  );

  return (
    <FormProvider handleSubmit={handleSubmit} {...methods}>
      <ModalContainer {...modalProps} onClose={handleClose} onClick={stopPropagation}>
        <ConfirmationModalHeader title={title} subtitle={subtitle} onClose={handleClose} />

        <FormComponent>
          <Modal.Content>{children}</Modal.Content>

          {showFooter && (
            <Modal.Footer
              data-status={
                submitError?.severity ?? (closeClicked ? SubmitSeverityState.error : undefined)
              }>
              {closeClicked ? (
                <>
                  <FooterMessage>
                    <SvgIcon name="Warning" />
                    Discard changes made in this form?
                  </FooterMessage>
                  <Button variant={Variant.PRIMARY} onClick={toggleCloseClicked}>
                    Cancel
                  </Button>
                  <Button variant={Variant.ATTENTION} onClick={handleClose}>
                    Discard
                  </Button>
                </>
              ) : (
                <>
                  {submitError?.message && (
                    <FooterMessage>
                      <SvgIcon name="Warning" />
                      {submitError.message}
                    </FooterMessage>
                  )}
                  <ActionsWrapper>
                    {customButtonProps && customButton}
                    <Button onClick={handleClose} variant={Variant.TERTIARY} size={Size.LARGE}>
                      {cancelText}
                    </Button>
                    <Button
                      onClick={event => {
                        handleSubmit(innerHandleSubmit, onError)();
                        stopPropagation(event);
                      }}
                      loading={methods.formState.isSubmitting}
                      disabled={
                        disabledSubmitButton ||
                        (formProps?.mode &&
                          formProps.mode !== 'onSubmit' &&
                          !methods.formState.isValid)
                      }
                      variant={
                        submitStatus === 'failure' || submitError
                          ? Variant.ATTENTION
                          : Variant.PRIMARY
                      }>
                      {submitError ? 'Retry' : submitText}
                    </Button>
                  </ActionsWrapper>
                </>
              )}
            </Modal.Footer>
          )}
        </FormComponent>
      </ModalContainer>
    </FormProvider>
  );
};

export const ConfirmationModalHeader = ({
  title,
  subtitle,
  onClose,
}: ConfirmationModalHeaderProps) => {
  return (
    <Modal.Header>
      <Modal.Title>{title}</Modal.Title>
      {subtitle && <Modal.Subtitle data-variant={Variant.SECONDARY}>{subtitle}</Modal.Subtitle>}
      <CircleButton onClick={onClose} size={Size.LARGE} variant={Variant.TERTIARY}>
        <SvgIcon name="CloseLarge" size={Size.LARGE} />
      </CircleButton>
    </Modal.Header>
  );
};

export const ModalContainer = styled(props => <Modal {...props} />)`
  width: 150rem;
  border-radius: 3rem;

  ${LogoSpinner} {
    height: 6rem;
  }

  ${Modal.Content} {
    font-weight: 400;
    padding: 0 8rem 6rem;
  }

  ${Modal.Header} {
    display: grid;
    position: relative;
    grid-template-areas:
      'title button'
      'subtitle never';
    grid-template-columns: 1fr auto;
    padding: 6rem 4rem 6rem 8rem;

    > ${IconButton}, > ${CircleButton} {
      grid-area: button;
    }

    ${Modal.Title} {
      grid-area: title;
    }

    ${Modal.Subtitle} {
      grid-area: subtitle;
    }

    > ${IconButton} {
      position: absolute;
      right: 4rem;

      &:hover {
        background-color: var(--color-blue-gray-15);
        border-radius: 3rem;
      }
    }
  }

  ${Modal.Title} {
    display: flex;
    align-items: center;
    gap: 3rem;
    font-weight: 600;
    color: var(--color-blue-gray-70);

    > ${BaseIcon} {
      width: 8rem;
      height: 8rem;
    }
  }

  ${Modal.Footer} {
    padding: 4rem 8rem 6rem;
    border-radius: 0 0 3rem 3rem;

    &[data-status=${SubmitSeverityState.warn}] {
      background-color: var(--color-yellow-25);

      ${BaseIcon} {
        color: var(--color-yellow-60);
      }
    }

    &[data-status=${SubmitSeverityState.error}] {
      background-color: var(--color-red-20);

      ${BaseIcon} {
        color: var(--color-red-45);
      }
    }
  }
`;

const Form = styled.form``;

const FooterMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
  padding: 2rem;
  flex-grow: 1;
`;

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
