import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Input } from '@src-v2/components/forms';
import { Field, Label } from '@src-v2/components/forms/modal-form-layout';
import {
  LabelWrapper,
  maxLengthValidation,
} from '@src-v2/containers/connectors/server-modal/connector-editor';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { humanize } from '@src-v2/utils/string-utils';
import { SubHeading4 } from '@src/src-v2/components/typography';

/**
 * @param {FieldOption[]} fieldOptions
 * @param fieldErrors
 * @param {boolean} isEdit
 */
export const ConnectorEditorFields = ({ fieldOptions, fieldErrors, isEdit }) => {
  const { setValue, setError, getValues, clearErrors } = useFormContext();

  const preventFormDefaults = useCallback(event => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }, []);

  return (
    <>
      {fieldOptions.map(option => {
        const fieldError = fieldErrors[option.name];
        const urlValue = getValues('url') || option.defaultValue;

        if (option.separateComponent) {
          return option.separateComponent;
        }

        if (option.tokenExpireDate) {
          return option.tokenExpireDate;
        }

        return (
          <Field key={option.name}>
            <LabelWrapper>
              {option.label ?? (
                <Label required={option.rules?.required}>
                  {option.displayName ?? humanize(option.name)}
                </Label>
              )}
              {option.subLabel ? <SubHeading4>{option.subLabel}</SubHeading4> : null}
            </LabelWrapper>
            {option.fixedDisplayValue ? (
              <FixedValueInput option={option} setValue={setValue} isEdit={isEdit} />
            ) : option.allowMultipleConnectorsUrl ? (
              <AllowMultipleConnectorsInput
                option={option}
                setValue={setValue}
                setError={setError}
                urlValue={urlValue}
                clearErrors={clearErrors}
                isEdit={isEdit}
              />
            ) : (
              <Controller
                {...option}
                render={({ field: { onChange, ...field }, fieldState: { invalid } }) =>
                  option.render?.({ onChange, field }, setError) ?? (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      data-invalid={dataAttr(invalid)}
                      onKeyPress={preventFormDefaults}
                      defaultValue={option.defaultValue}
                      placeholder={option.placeholder}
                      type={option.type ?? 'text'}
                      onChange={event => {
                        option.onChange?.(setValue, event, getValues);
                        onChange(event);
                      }}
                      // @ts-expect-error
                      disabled={field.disabled || option.disabled}
                    />
                  )
                }
              />
            )}
            {(fieldError?.type === 'validateMaxLength' ||
              fieldError?.type === 'validateBrokerPublicKey') && (
              <ErrorsMessage>{fieldError.message}</ErrorsMessage>
            )}
          </Field>
        );
      })}
    </>
  );
};

const FixedValueInput = ({ option, setValue, isEdit }) => {
  useEffect(() => {
    if (!isEdit) {
      setValue(option.name, option.fixedValue);
    }
  }, [option.name, option.fixedDisplayValue, isEdit]);

  return <Input value={option.fixedDisplayValue} readOnly disabled />;
};

const AllowMultipleConnectorsInput = ({
  option,
  setValue,
  urlValue,
  setError,
  clearErrors,
  isEdit,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const editUrl = useRef(urlValue);
  useEffect(() => setValue('url', editUrl.current), [editUrl.current, option.name]);
  return (
    <AllowMultipleConnectorsInputContainer key={option.name}>
      <Input
        data-invalid={dataAttr(Boolean(validateUrlInput({ option, urlValue, isDirty, isEdit })))}
        defaultValue={urlValue}
        placeholder={option.placeholder}
        disabled={isEdit}
        onChange={event => {
          setValue(
            'url',
            // @ts-expect-error
            event.target.value
              ? // @ts-expect-error
                `${event.target.value}/?display_name=${crypto.randomUUID()}`
              : editUrl.current
          );
        }}
        onBlur={event => {
          if (event.target.value) {
            setIsDirty(true);
          }

          const error = validateUrlInput({
            option,
            urlValue: event.target.value,
            setError,
            clearErrors,
            isDirty,
            isEdit,
          });
          setErrorMessage(error);
        }}
      />
      {errorMessage && <ErrorsMessage>{errorMessage}</ErrorsMessage>}
    </AllowMultipleConnectorsInputContainer>
  );
};

function validateUrlInput({
  option: { existingServers, providerGroupName },
  urlValue,
  setError,
  clearErrors,
  isDirty,
  isEdit,
}: {
  option: { existingServers: any[]; providerGroupName: string };
  urlValue: string;
  setError?: (arg0: string, arg1: { type: string; message: string }) => void;
  clearErrors?: (field: string) => void;
  isDirty: boolean;
  isEdit: boolean;
}) {
  let error = { errorType: '', errorMessage: '' };

  if (!isEdit && isDirty && !urlValue) {
    error = { errorType: 'required', errorMessage: 'Field is required' };
  }
  if (!maxLengthValidation('url', urlValue)) {
    error = { errorType: 'maxLengthValidation', errorMessage: 'Maximum length exceeded' };
  }

  if (!/^\S*$/.test(urlValue)) {
    error = { errorType: 'whitespaces', errorMessage: 'Whitespaces are not allowed' };
  }

  if (
    !isEdit &&
    existingServers?.find(
      server => server.url === urlValue && providerGroupName === server.providerGroup
    )
  ) {
    error = {
      errorType: 'serverExist',
      errorMessage: 'Another connector with the same URL is already configured',
    };
  }

  if (error.errorMessage) {
    setError?.('url', {
      type: error.errorType,
      message: error?.errorMessage,
    });
  } else {
    clearErrors?.('url');
  }

  return error.errorMessage;
}

const AllowMultipleConnectorsInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageContainer = styled.div`
  display: flex;
  padding: 2rem;
  margin-top: 2rem;
  flex-direction: column;
  border-radius: 1rem;
  border: 0.25rem solid transparent;
  gap: 1rem;
`;

export const ErrorsMessage = styled(MessageContainer)`
  color: var(--color-red-60);
  background-color: var(--color-red-10);
  border-color: var(--color-red-20);
`;

/**
 * @typedef {Object} FieldOption
 * @property {string} name
 * @property {string} [displayName] Label's text, if null would use name
 * @property {ReactElement} [label] if exists will override displayName and name as the Label
 * @property {string} [type] Input's type
 * @property {string} [fixedDisplayValue] Will disable the Input and present the fixed value
 * @property {string} [fixedValue] Sends this value as the field value when fixedDisplayValue is set
 * @property {string} [defaultValue]
 * @property {string} [placeholder] Placeholder value, in case a default value does not exist
 * @property {Object[]} [rules] react-hook-form controller rules
 * @property {boolean} [disabled]
 * @property {onChange} [onChange]
 */

/**
 * @callback onChange enables to manipulate the form data from outside when input changes
 * @param {setValue} setValue
 * @param {Object} event
 * @param {getValues} getValues
 */

/**
 * @callback setValue react-hook-form default setValue function
 * @param {string} name
 * @param value
 * @param {Object} [options]
 */
