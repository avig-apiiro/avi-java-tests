import React, { ChangeEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Input } from '@src-v2/components/forms';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

type StretchingInputProps = {
  value?: string;
  placeholder?: string;
  onBlur?: (value: string) => void;
  onFocus?: (value: string) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onDelete?: (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;
};

export const StretchingInput = styled(
  ({
    value,
    placeholder = '+',
    onBlur,
    onFocus,
    onChange,
    onDelete,
    ...props
  }: StyledProps<StretchingInputProps>) => {
    const [inputValue, setInputValue] = useState(value ?? '');
    const [isFocus, setIsFocus] = useState(false);

    const handleBlur = useCallback(() => {
      onBlur?.(inputValue);
      setIsFocus(false);
    }, [inputValue, onBlur]);

    const handleFocus = useCallback(() => {
      onFocus?.(inputValue);
      setIsFocus(true);
    }, [inputValue, onFocus]);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        onChange?.(event);
      },
      [onChange]
    );

    const handleDelete = useCallback(
      (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        setInputValue('');
        onDelete?.(event);
      },
      [onDelete]
    );
    return (
      <div {...props} data-focus={dataAttr(isFocus)}>
        <Input
          data-empty={dataAttr(inputValue.length === 0)}
          value={inputValue}
          placeholder={isFocus ? '' : placeholder}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onChange={handleChange}
        />
        <HiddenContainer>{inputValue}</HiddenContainer>
        {inputValue.length > 0 && <SvgIcon name="Close" onClick={handleDelete} />}
      </div>
    );
  }
)`
  min-width: 1rem;
  max-width: 110rem;
  display: flex;
  justify-content: space-between;
  position: relative;
  height: 6rem;
  border: 0.25rem solid var(--color-blue-60);
  border-radius: 100vmax;
  background-color: var(--color-blue-30);
  white-space: nowrap;
  transition: min-width 300ms;

  &[data-focus] {
    min-width: 20rem;
  }

  &:hover {
    background-color: var(--color-blue-35);
  }

  ${Input} {
    max-width: 98.5rem;
    position: absolute;
    inset: 0;
    top: -0.25rem;
    height: inherit;
    line-height: inherit;
    font-size: var(--font-size-s);
    border: none;
    padding: 0 0 0 3rem;
    background-color: transparent;

    &[data-empty] {
      padding: 0;
      text-align: center;
    }

    &:focus {
      min-width: 20rem;
      text-align: left;
      padding-left: 3rem;
    }

    &::placeholder {
      font-size: var(--font-size-l);
      color: var(--color-blue-gray-50);
    }
  }

  ${BaseIcon} {
    position: relative;
    right: 1rem;
    color: var(--color-blue-gray-50);
  }
`;

const HiddenContainer = styled.span`
  max-width: 100rem;
  display: inline-block;
  visibility: hidden;
  padding: 0 3rem;
`;
