import { forwardRef } from 'react';
import styled from 'styled-components';
import { CustomInput } from '@src-v2/components/forms/custom-input';
import { InputLabel } from '@src-v2/components/forms/form-layout-v2';

type CheckboxToggleProps = {
  checked: boolean;
  onChange: (event) => void;
  disabled?: boolean;
};

export const CheckboxToggle = styled(
  forwardRef<HTMLInputElement, CheckboxToggleProps>((props: CheckboxToggleProps, ref) => (
    <CustomInput ref={ref} {...props} type="checkbox" />
  ))
)`
  position: relative;
  display: inline-flex;
  width: 6rem;
  height: 3.5rem;
  flex: 0 0 auto;
  vertical-align: text-bottom;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    background-color: var(--color-blue-gray-20);
    border: 0.25rem solid var(--color-blue-gray-30);
    border-radius: 100vmax;
    transition: background-color 200ms;
  }

  &:after {
    content: '';
    position: absolute;
    top: var(--checkbox-toggle-thumb-padding, 0.25rem);
    left: var(--checkbox-toggle-thumb-padding, 0.25rem);
    width: var(--checkbox-toggle-thumb-size, 3rem);
    height: var(--checkbox-toggle-thumb-size, 3rem);
    background-color: var(--color-white);
    border-radius: 100vmax;
    transition: left 200ms;
  }

  ${InputLabel}:hover > &:not([data-disabled]),
  &:not([data-disabled]):hover {
    cursor: pointer;
    
    &:before {
      background-color: var(--color-blue-gray-30);
      border: 0.25rem solid var(--color-blue-gray-40);
    }
  }

  ${CustomInput.HiddenInput}:checked + &[data-disabled] {
    cursor: default;
    pointer-events: none;

    &:before {
      background-color: var(--color-green-25);
      border: 0.25rem solid var(--color-green-25);
    }

    &:after {
      left: calc(
        100% - var(--checkbox-toggle-thumb-size, 3rem) - var(--checkbox-toggle-thumb-padding,
        0.25rem)
      );
    }
  }

  ${CustomInput.HiddenInput}:checked + &:not([data-disabled]) {
    &:before {
      background-color: var(--color-green-50);
      border: 0.25rem solid var(--color-green-50);
    }

    &:after {
      left: calc(
        100% - var(--checkbox-toggle-thumb-size, 3rem) - var(--checkbox-toggle-thumb-padding,
        0.25rem)
      );
    }

    ${InputLabel}:hover &,
    &:hover {
      &:before {
        background-color: var(--color-green-55);
        border: 0.25rem solid var(--color-green-55);
      }
    }
  }
}
`;
