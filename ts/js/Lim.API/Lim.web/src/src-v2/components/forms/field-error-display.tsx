import styled from 'styled-components';
import { Clamp, ClampText } from '@src-v2/components/clamp-text';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { StubAny } from '@src-v2/types/stub-any';

type ErrorsType = 'required' | 'pattern';

export const ErrorTypeMapping: Record<ErrorsType, string> = {
  required: 'This field is required',
  pattern: 'This field did match the pattern',
};

export function FieldErrorDisplay({ error, lavel = 'error' }: { error: StubAny; lavel?: string }) {
  const errorMessage = () =>
    error?.message || ErrorTypeMapping[error?.type as keyof typeof ErrorTypeMapping];
  return (
    <>
      {error && (
        <ErrorMessageWrapper>
          <SvgIcon name="Warning" data-lavel={lavel} />
          <ClampText lines={2}>{errorMessage()}</ClampText>
        </ErrorMessageWrapper>
      )}
    </>
  );
}

export const ErrorMessageWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;

  ${Clamp} {
    font-size: var(--font-size-xs);
    font-weight: 400;
    color: var(--color-blue-gray-70);
  }

  ${BaseIcon}[data-name="Warning"] {
    display: flex;
    align-self: start;
    width: 5rem;
    height: 5rem;

    &[data-lavel='error'] {
      color: var(--color-red-50);
    }

    &[data-lavel='warning'] {
      color: var(--color-orange-55);
    }
  }
`;
