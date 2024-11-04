import { ChangeEvent, MouseEventHandler, forwardRef } from 'react';
import styled from 'styled-components';
import { CustomInput } from '@src-v2/components/forms/custom-input';
import { InputLabel } from '@src-v2/components/forms/form-layout-v2';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  icon?: string;
  indeterminateIcon?: string;
  disabled?: boolean;
}

export const Checkbox = styled(
  forwardRef<HTMLInputElement, StyledProps<CheckboxProps>>(
    ({ icon = 'Check', checked, indeterminate, indeterminateIcon = 'Minus', ...props }, ref) => {
      return (
        <CustomInput
          ref={ref}
          {...props}
          checked={checked}
          type="checkbox"
          data-disabled={dataAttr(props.disabled)}
          data-checked={dataAttr(checked)}
          data-indeterminate={dataAttr(indeterminate)}>
          <SvgIcon name={checked ? icon : indeterminateIcon} />
        </CustomInput>
      );
    }
  )
)`
  position: relative;
  display: inline-flex;
  width: 4rem;
  height: 4rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  vertical-align: text-bottom;
  cursor: pointer;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 1rem;
    border: 0.25rem solid var(--color-blue-gray-40);
    background-color: var(--color-white);
    cursor: pointer;
    transition: all 75ms ease-in-out;
  }

  ${BaseIcon} {
    position: relative;
    width: 100%;
    color: var(--color-white);
    pointer-events: none;
    visibility: hidden;
  }

  &:not([data-disabled]) {
    ${InputLabel}:hover &,
    ${CustomInput.HiddenInput}:hover + & {
      &[data-checked],
      &[data-indeterminate] {
        &:before {
          border-color: var(--color-blue-65);
          background-color: var(--color-blue-65);
        }
      }

      &:before {
        border-color: var(--color-blue-60);
      }
    }
  }

  &[data-disabled] {
    cursor: default;
  }

  &[data-checked],
  &[data-indeterminate] {
    &:before {
      border-color: var(--color-blue-60);
      background-color: var(--color-blue-60);
    }

    ${BaseIcon} {
      visibility: visible;
    }
  }

  ${CustomInput.HiddenInput}:disabled + & {
    &:before {
      cursor: default;
      border-color: var(--color-blue-gray-35);
      background-color: var(--color-blue-gray-35);
    }

    ${BaseIcon} {
      color: var(--color-white);
      stroke: var(--color-white);
    }
  }
`;
