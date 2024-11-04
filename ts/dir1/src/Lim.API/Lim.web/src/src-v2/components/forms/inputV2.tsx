import React, { ForwardedRef, InputHTMLAttributes, forwardRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { FieldErrorDisplay } from '@src-v2/components/forms/field-error-display';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { useForwardRef } from '@src-v2/hooks';
import { useTextClamp } from '@src-v2/hooks/use-clamp-text';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { setInputValue } from '@src-v2/utils/input-setter';
import { Tooltip } from '../tooltips/tooltip';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name?: string;
  id?: string;
  iconName?: string;
  onClearClicked?: () => void;
  error?: {
    message?: string;
    ref: Record<string, () => void>;
    type: string;
  };
}

export const InputV2 = styled(
  forwardRef<HTMLInputElement, StyledProps<InputProps>>(
    ({ error, onBlur, name, id, onClearClicked, iconName, onChange, ...props }, ref) => {
      const inputRef: ForwardedRef<HTMLInputElement> = useForwardRef(ref);
      const [inputText, setInputText] = useState('');
      const [, isClamped] = useTextClamp(inputRef, inputText);

      const handleClear = useCallback(() => setInputValue(inputRef.current, ''), [ref]);

      const handleClearClick = useCallback(() => {
        handleClear();
        onClearClicked?.();
      }, [handleClear, onClearClicked]);

      const handleOnBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        setInputText(event?.target?.value);
        onBlur?.(event);
      }, []);

      const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event?.target?.value);
        onChange?.(event);
      };

      return (
        <InputArea {...props}>
          <Tooltip disabled={!isClamped} content={inputRef?.current?.value}>
            <InputFieldWrapper type={props.type} data-test-marker="search-bar">
              <InputField
                {...props}
                ref={inputRef}
                id={id}
                data-invalid={dataAttr(Boolean(error) || props['data-invalid'])}
                onBlur={handleOnBlur}
                onChange={handleOnChange}
                autoComplete="off"
              />
              <IconButton onClick={handleClearClick} name="Close" />
              {iconName && <SvgIcon name={iconName} />}
            </InputFieldWrapper>
          </Tooltip>
          <FieldErrorDisplay error={error} />
        </InputArea>
      );
    }
  )
)``;

const InputArea = styled.div`
  width: 100%;
`;

export const InputField = styled.input`
  width: 100%;
  max-width: 100%;
  height: 9rem;
  padding: ${(props: InputProps) =>
    props.onClearClicked ? '1rem 10rem 1rem 3rem' : '1rem 1rem 1rem 3rem'};

  color: var(--color-blue-gray-70);
  font-size: var(--font-size-s);
  font-weight: 400;
  background-color: var(--color-white);

  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 2rem;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[type='number'] {
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      -moz-appearance: none;
    }
  }

  &:not(:placeholder-shown) ~ ${IconButton}[data-name="Close"] {
    display: block;
  }

  &:focus {
    border-color: var(--color-blue-65);
  }

  &::placeholder {
    color: var(--color-blue-gray-50);
    font-weight: 300;
  }

  &:invalid,
  &[data-invalid] {
    border-color: var(--color-red-55);

    &:focus {
      border-color: var(--color-red-65);
    }
  }

  &[data-readonly],
  &:read-only {
    cursor: not-allowed;
    color: var(--color-blue-gray-50);
    background-color: var(--color-blue-gray-10);
    border-color: var(--color-blue-gray-30);
  }

  &:disabled {
    color: var(--color-blue-gray-35);
    background-color: var(--color-white);
    cursor: not-allowed;
  }

  &:placeholder-shown ~ [data-name='Search'] {
    display: block;
    color: var(--color-blue-gray-50);
  }
`;

const InputFieldWrapper = styled.div<{ type: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${IconButton}[data-name="Close"], > ${BaseIcon} {
    position: absolute;
    display: none;
    right: ${props => (props.type === 'date' ? '6rem' : '3rem')};
    transform: translate(0, -50%);
    top: 50%;

    &[data-type='date'] {
      right: 5rem;
    }
  }

  ${InputField} {
    &:disabled {
      ~ ${IconButton} {
        display: none;
      }
    }
  }

  &:hover {
    ${InputField} {
      border-color: var(--color-blue-gray-50);

      &:invalid,
      &[data-invalid] {
        border-color: var(--color-red-60);
      }

      &[data-readonly],
      &:read-only,
      &:disabled {
        border-color: var(--color-blue-gray-30);

        ~ ${IconButton} {
          display: none;
        }
      }
    }
  }
`;
