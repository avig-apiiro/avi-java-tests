import { forwardRef } from 'react';
import styled from 'styled-components';
import { CustomInput } from '@src-v2/components/forms/custom-input';
import { InputLabel } from '@src-v2/components/forms/form-layout-v2';
import { InputProps } from '@src-v2/components/forms/inputV2';
import { StyledProps } from '@src-v2/types/styled';

export const Radio = styled(
  forwardRef<HTMLInputElement, StyledProps<InputProps>>((props, ref) => (
    <CustomInput ref={ref} {...props} type="radio" />
  ))
)`
  position: relative;
  display: inline-flex;
  width: 4.5rem;
  height: 4.5rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  vertical-align: text-bottom;
  cursor: pointer;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    border: 0.25rem solid var(--color-blue-gray-30);
    border-radius: 100vmax;
  }

  &:hover,
  ${InputLabel}:hover & {
    &:before {
      border-color: var(--color-blue-55);
    }
  }

  ${CustomInput.HiddenInput}:checked + & {
    &:before {
      border-color: var(--color-blue-60);
    }

    &:after {
      content: '';
      position: absolute;
      width: calc(2.5 / 4.5 * 100%);
      height: calc(2.5 / 4.5 * 100%);
      background-color: var(--color-blue-60);
      border-radius: 100vmax;
    }
  }

  ${CustomInput.HiddenInput}:disabled + & {
    &:before,
    &:hover:before {
      background-color: var(--color-blue-gray-15);
      border-color: var(--color-blue-gray-30);
    }

    &:after,
    &:hover:after {
      background-color: var(--color-blue-gray-30);
    }
  }
`;
