import React, { forwardRef, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { EditableExpressionError } from '@src-v2/types/governance/governance-rules';
import { dataAttr } from '@src-v2/utils/dom-utils';

export type PropagatedEvent = 'focusNext' | 'focusPrevious' | 'backspace';

type PropagatedInputEvents = {
  onPropagatedEvent: (event: PropagatedEvent) => void;
  onFocusedSelectionChanged: (selectionStart: number, selectionEnd: number) => void;
};

export type InterpolatedStringComponentEditorProps<T> = {
  value: T;
  onChange: (newValue: T) => void;
  readOnly: boolean;
  last: boolean;
  errors?: EditableExpressionError[];
} & PropagatedInputEvents;

export const RawStringEditor = forwardRef(function RawStringEditor(
  {
    value,
    onChange,
    onPropagatedEvent,
    onFocusedSelectionChanged,
    readOnly,
    last,
  }: InterpolatedStringComponentEditorProps<string>,
  ref
) {
  return (
    <LiteralContainer data-last={dataAttr(last)}>
      <SelectionEventPropagatingControl
        value={value}
        onChange={event => onChange(event.target.value)}
        readOnly={readOnly}
        onPropagatedEvent={onPropagatedEvent}
        onFocusedSelectionChanged={onFocusedSelectionChanged}
        last={last}
        ref={ref}
      />
    </LiteralContainer>
  );
});

export const ApiiroQlTokenEditor = forwardRef(function ApiiroQlTokenEditor(
  { errors, ...props }: InterpolatedStringComponentEditorProps<{ apiiroQl: string }>,
  ref
) {
  return errors?.length ? (
    <Tooltip
      content={
        <ul>
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      }>
      <ApiiroQlTokenEditorInternalEditor {...props} errors={errors} ref={ref} />
    </Tooltip>
  ) : (
    <ApiiroQlTokenEditorInternalEditor {...props} errors={errors} ref={ref} />
  );
});

const ApiiroQlTokenEditorInternalEditor = forwardRef(function ApiiroQlTokenEditor(
  {
    value,
    onChange,
    readOnly,
    onPropagatedEvent,
    onFocusedSelectionChanged,
    errors,
  }: InterpolatedStringComponentEditorProps<{ apiiroQl: string }>,
  ref
) {
  return (
    <ExpressionTokenStyledContainer
      data-invalid={dataAttr(Boolean(errors?.length))}
      data-readonly={dataAttr(readOnly)}>
      <SvgIcon name="Warning" />
      <SelectionEventPropagatingControl
        value={value.apiiroQl}
        onChange={event => onChange({ apiiroQl: event.target.value })}
        readOnly={readOnly}
        onPropagatedEvent={onPropagatedEvent}
        onFocusedSelectionChanged={onFocusedSelectionChanged}
        last={false}
        ref={ref}
      />
      <IconButton onClick={() => onChange({ apiiroQl: '' })} name="Close" />
    </ExpressionTokenStyledContainer>
  );
});

type SelectionEventPropagatingControlProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  last: boolean;
  readOnly: boolean;
} & PropagatedInputEvents;

const SelectionEventPropagatingControl = forwardRef(function InputWithFocusLeftRight(
  {
    value,
    onChange,
    onFocusedSelectionChanged,
    onPropagatedEvent,
    readOnly,
    last,
  }: SelectionEventPropagatingControlProps,
  ref
) {
  const inputRef = useRef<HTMLInputElement>();

  const handleKeyDown = useCallback(
    event => {
      if (inputRef.current?.selectionStart === 0 && event.key === 'ArrowLeft') {
        onPropagatedEvent('focusPrevious');
        event.stopPropagation();
        event.preventDefault();
      } else if (
        inputRef.current?.selectionStart === inputRef.current?.value.length &&
        event.key === 'ArrowRight'
      ) {
        onPropagatedEvent('focusNext');
        event.stopPropagation();
        event.preventDefault();
      } else if (
        inputRef.current?.selectionStart === 0 &&
        inputRef.current?.selectionEnd === 0 &&
        event.key === 'Backspace'
      ) {
        onPropagatedEvent('backspace');
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [onPropagatedEvent, inputRef]
  );

  const handleSelect = useCallback(
    event => {
      if (document.activeElement === event.target) {
        onFocusedSelectionChanged(event.target.selectionStart, event.target.selectionEnd);
      }
    },
    [onFocusedSelectionChanged]
  );

  const handleFocus = useCallback(
    event => {
      onFocusedSelectionChanged(event.target.selectionStart, event.target.selectionEnd);
    },
    [onFocusedSelectionChanged]
  );

  return (
    <InputSizingContainer data-last={dataAttr(last)}>
      <pre>{value}</pre>
      <input
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        disabled={readOnly}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onFocus={handleFocus}
        ref={el => {
          inputRef.current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else {
            ref.current = el;
          }
        }}
      />
    </InputSizingContainer>
  );
});

export const LiteralContainer = styled.div`
  display: flex;

  height: 6rem;
  padding-top: 0.25rem;

  &[data-last] {
    flex-grow: 1;
  }
`;

export const ExpressionTokenStyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  padding: 0 1rem 0 2rem;

  border: dashed 0.25rem var(--color-purple-40);
  border-radius: 1rem;
  background-color: var(--color-purple-15);
  height: 6rem;

  input {
    background-color: var(--color-purple-15);
  }

  ${BaseIcon}[data-name="Warning"] {
    width: 5rem;
    height: 5rem;

    display: none;
    color: var(--color-red-50);
  }

  ${IconButton} {
    margin: 0 -1rem;
  }

  &[data-invalid] {
    border-color: var(--color-red-35);
    background-color: var(--color-red-10);

    input {
      background-color: var(--color-red-10);
    }

    ${BaseIcon}[data-name="Warning"] {
      display: flex;
      align-self: start;
    }
  }

  &[data-readonly] {
    border-color: var(--color-purple-20);
    background-color: var(--color-purple-15);
    border-style: solid;

    input {
      background-color: var(--color-purple-15);

      &:disabled {
        background: var(--color-purple-15);
      }
    }

    ${IconButton} {
      display: none;
    }
  }

  &:hover:not([data-readonly]) {
    border-color: var(--color-purple-50);
    background-color: var(--color-purple-20);

    input {
      background-color: var(--color-purple-20);
    }
  }

  &:focus-within {
    border-color: var(--color-purple-65);
    background-color: var(--color-purple-15);

    input {
      background-color: var(--color-purple-15);
    }
  }
`;

export const InputSizingContainer = styled.div`
  min-width: 1rem;
  height: 5.5rem;

  display: inline-block;
  position: relative;

  flex-grow: 0;
  flex-shrink: 0;

  &[data-last] {
    flex-grow: 1;
  }

  pre {
    font-family: inherit;
  }

  input {
    position: absolute;
    inset: 0;
    cursor: default;

    &:disabled {
      background: var(--color-white);
      cursor: default;
    }
  }
`;
