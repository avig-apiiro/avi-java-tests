import { HTMLProps, forwardRef } from 'react';
import styled from 'styled-components';
import { StyledProps } from '@src-v2/types/styled';

export const Input = styled(
  forwardRef<HTMLInputElement, HTMLProps<HTMLInputElement> & StyledProps>((props, ref) => (
    <input ref={ref} autoComplete="off" {...props} />
  ))
)`
  width: 100%;
  height: 9rem;
  padding: 0 3rem;
  font-size: var(--font-size-m);
  line-height: 9rem;
  color: var(--color-blue-gray-70);
  background-color: var(--color-white);
  box-shadow: inset 0 0.5rem 0 var(--input-shadow-color);
  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 2rem;
  font-weight: 300;

  &::placeholder {
    font-weight: 300;
    color: var(--color-blue-gray-50);
  }

  &:disabled {
    color: var(--color-blue-gray-50);
    background-color: var(--color-blue-gray-15);

    &::placeholder {
      color: var(--color-blue-gray-40);
    }
  }

  &:invalid,
  &[data-invalid] {
    border-color: var(--color-red-55);

    &:hover {
      border-color: var(--color-red-60);
    }

    &:focus {
      border-color: var(--color-red-65);
    }
  }

  &[data-readonly] {
    color: var(--color-blue-gray-60);
    background-color: var(--color-blue-gray-15);
    border-color: var(--color-blue-gray-30);
    text-overflow: ellipsis;
  }

  &::placeholder,
  &:placeholder-shown {
    color: var(--color-blue-gray-45);
    text-overflow: ellipsis;
  }
`;
