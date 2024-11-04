import { ChangeEvent, ForwardedRef, InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Clamp, ClampText } from '@src-v2/components/clamp-text';
import { ErrorTypeMapping } from '@src-v2/components/forms/field-error-display';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Caption1 } from '@src-v2/components/typography';
import { useForwardRef } from '@src-v2/hooks';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  name?: string;
  charLimit?: number;
  rows?: number;
  value?: string;
  error?: {
    message?: string;
    ref: Record<string, () => void>;
    type: string;
  };
}

export const Textarea = styled(
  forwardRef<HTMLTextAreaElement, StyledProps<TextAreaProps>>(
    ({ error, name, value, charLimit, rows = 5, onChange, ...props }, ref) => {
      const textAreaRef: ForwardedRef<HTMLTextAreaElement> = useForwardRef(ref);

      const errorMessage = () => error?.message || ErrorTypeMapping[error?.type];

      const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        if (!charLimit || event.target.value.length <= charLimit) {
          onChange?.(event);
        }
      };

      return (
        <TextAreaContainer {...props}>
          <TextAreaWrapper>
            <TextAreaField
              {...props}
              value={value}
              ref={textAreaRef}
              data-invalid={dataAttr(Boolean(error) || props['data-invalid'])}
              autoComplete="off"
              rows={rows}
              onChange={handleChange}
              maxLength={charLimit}
            />
            {charLimit && (
              <CharCount>
                {textAreaRef.current?.value.length || value.length || 0}/{charLimit}
              </CharCount>
            )}
          </TextAreaWrapper>
          {error && (
            <ErrorMessageWrapper>
              <SvgIcon name="Warning" />
              <ClampText lines={2}>{errorMessage()}</ClampText>
            </ErrorMessageWrapper>
          )}
        </TextAreaContainer>
      );
    }
  )
)``;

const TextAreaContainer = styled.div`
  width: 100%;
`;

const CharCount = styled(Caption1)`
  color: var(--color-blue-gray-40);
  text-align: end;
`;

export const TextAreaField = styled.textarea`
  width: 100%;
  max-width: 100%;
  padding: 2rem 3rem;

  color: var(--color-blue-gray-70);
  font-size: var(--font-size-s);
  font-weight: 400;
  background-color: var(--color-white);

  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 2rem;

  resize: none;

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
`;

const TextAreaWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &:hover {
    ${TextAreaField} {
      border-color: var(--color-blue-gray-50);

      &:invalid,
      &[data-invalid] {
        border-color: var(--color-red-60);
      }

      &[data-readonly],
      &:read-only,
      &:disabled {
        border-color: var(--color-blue-gray-30);
      }
    }
  }
`;

const ErrorMessageWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  ${Clamp} {
    font-size: var(--font-size-xs);
    font-weight: 400;
    color: var(--color-blue-gray-70);
  }

  ${BaseIcon}[data-name="Warning"] {
    display: flex;
    align-self: start;
    color: var(--color-red-50);
    width: 5rem;
    height: 5rem;
  }
`;
