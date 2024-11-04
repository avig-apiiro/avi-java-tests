import { forwardRef, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  ApiiroQlTokenEditor,
  InterpolatedStringComponentEditorProps,
  PropagatedEvent,
  RawStringEditor,
} from '@src-v2/components/apiiroql-interpolated-string-editor/apiiroql-interpolated-string-component-editors';
import {
  EditedTokenizedStringComponent,
  TokenizedStringComponent,
  getTokenizedStringComponentLength,
  useEditedComponents,
} from '@src-v2/components/apiiroql-interpolated-string-editor/apiiroql-interpolated-string-editor-state';
import {
  InterpolatedStringEditorSuggestionsPopover,
  TokenSuggestionsGenerator,
} from '@src-v2/components/apiiroql-interpolated-string-editor/apiiroql-interpolated-string-editor-suggestions-popover';
import { IconButton } from '@src-v2/components/buttons';
import { EditableApiiroQlExpressionTokenizedString } from '@src-v2/containers/smart-policy/smart-policy-entity-query-editor';
import { EditableExpressionError } from '@src-v2/types/governance/governance-rules';
import { dataAttr } from '@src-v2/utils/dom-utils';

type ApiiroQlInterpolatedStringEditorProps = {
  value: EditableApiiroQlExpressionTokenizedString;
  onChange?: (newValue: EditableApiiroQlExpressionTokenizedString) => void;
  readOnly?: boolean;
  errors: EditableExpressionError[];
  tokenSuggestionGenerators?: TokenSuggestionsGenerator[];
};

export const ApiiroQlInterpolatedStringEditor = forwardRef<
  HTMLDivElement,
  ApiiroQlInterpolatedStringEditorProps
>(function ApiiroQlInterpolatedStringEditor(
  {
    value,
    onChange,
    readOnly,
    errors,
    tokenSuggestionGenerators,
  }: ApiiroQlInterpolatedStringEditorProps,
  forwardedRef
) {
  const [focusedCharacter, setFocusedCharacter] = useState<number>(0);
  const [focusedComponentIndex, setFocusedComponentIndex] = useState<number>(-1);

  const {
    editedComponents,
    getCharacterIndexFromComponentIndexAndOffset,
    getComponentIndexAndOffsetForCharacterIndex,
    updateComponent,
    deleteComponent,
    clearAllComponents,
    insertTokenAtCharacter,
    isEmpty,
  } = useEditedComponents(value, onChange);

  const componentEditorRefs = useRef([]);

  const focusOnComponentAndIndex = useCallback((compoenntIndex, offsetInComponent) => {
    const selectedComponentEditor = componentEditorRefs.current[compoenntIndex];
    if (selectedComponentEditor) {
      selectedComponentEditor.focus();
      selectedComponentEditor.selectionStart = offsetInComponent;
      selectedComponentEditor.selectionEnd = offsetInComponent;
    }
  }, []);

  /// Implementation note: this callback uses setTimeout() in various use-cases to defer
  /// focus setting after component state is updated and rendered.
  /// The intent is that the editor will focus on the requested character at the time of the callback
  /// invocation. This means the setTimout callback  can't rely on state that changes per render
  /// since then it will work based on the state captured at the invocation ot setTimeout() rather
  /// than the state in effect when the callback runs.
  const focusOnCharacterLater = useCallback(
    (focusCharacterIndex: number, offsetAdjust: number = 0) => {
      setTimeout(() => {
        const { containingComponentIndex, offsetInComponent } =
          getComponentIndexAndOffsetForCharacterIndex(focusCharacterIndex);

        focusOnComponentAndIndex(containingComponentIndex, offsetInComponent + offsetAdjust);
      }, 0);
    },
    [componentEditorRefs, getComponentIndexAndOffsetForCharacterIndex]
  );

  const handlePropagatedEvent = useCallback(
    (index: number, event: PropagatedEvent) => {
      switch (event) {
        case 'focusNext':
          if (event === 'focusNext' && index < editedComponents.length - 1) {
            focusOnComponentAndIndex(index + 1, 0);
          }
          break;

        case 'focusPrevious':
          if (index > 0) {
            focusOnComponentAndIndex(
              index - 1,
              getTokenizedStringComponentLength(editedComponents[index - 1].component)
            );
          }
          break;

        case 'backspace':
          if (index > 1 && typeof editedComponents[index - 1].component === 'object') {
            const postUpdateFocusCharacter = getCharacterIndexFromComponentIndexAndOffset(
              index - 2,
              -1
            );
            deleteComponent(index - 1);
            focusOnCharacterLater(postUpdateFocusCharacter);
          }
          break;

        default:
          break;
      }
    },
    [editedComponents, componentEditorRefs, value, focusedCharacter, focusOnCharacterLater]
  );

  const handleComponentUpdate = useCallback(
    (index: number, component: TokenizedStringComponent) => {
      if (typeof component === 'object' && component.apiiroQl === '') {
        const newCharacterIndex = getCharacterIndexFromComponentIndexAndOffset(index, 0);
        if (newCharacterIndex > 0) {
          focusOnCharacterLater(newCharacterIndex);
        }
        deleteComponent(index);
      } else {
        updateComponent(index, component);
      }
    },

    [updateComponent, componentEditorRefs, focusOnCharacterLater]
  );

  const handleFocusSelectionChange = useCallback(
    (index: number, selectionStart: number) => {
      setFocusedComponentIndex(index);
      setFocusedCharacter(getCharacterIndexFromComponentIndexAndOffset(index, selectionStart));
    },
    [editedComponents]
  );

  const handleInsertToken = useCallback(
    (tokenContent: string) => {
      const insertTargetCharacter = focusedCharacter;
      if (insertTokenAtCharacter(insertTargetCharacter, tokenContent)) {
        focusOnCharacterLater(insertTargetCharacter + tokenContent.length + 1, -1);
      }
    },
    [focusOnCharacterLater, focusedCharacter, insertTokenAtCharacter]
  );

  function generateComponentEditorProperties<TToken extends TokenizedStringComponent>(
    valueComponents: EditedTokenizedStringComponent[],
    valueComponent: EditedTokenizedStringComponent,
    index: number
  ): InterpolatedStringComponentEditorProps<TToken> & { key: string; ref: any } {
    return {
      key: valueComponent.key,
      value: valueComponent.component as TToken,
      readOnly,
      onChange: (newValue: TToken) => handleComponentUpdate(index, newValue),
      onPropagatedEvent: (event: PropagatedEvent) => handlePropagatedEvent(index, event),
      onFocusedSelectionChanged: (selectionStart: number) =>
        handleFocusSelectionChange(index, selectionStart),
      last: index === valueComponents.length - 1,
      ref: (element: any) => (componentEditorRefs.current[index] = element),
    };
  }

  return (
    <FieldWrapper
      ref={forwardedRef}
      data-readonly={dataAttr(readOnly)}
      data-invalid={dataAttr(Boolean(errors?.length))}>
      <EditedComponentsContainer>
        {editedComponents.map((valueComponent, index, valueComponents) => {
          return typeof valueComponent.component === 'string' ? (
            <RawStringEditor
              {...generateComponentEditorProperties<string>(valueComponents, valueComponent, index)}
            />
          ) : (
            <ApiiroQlTokenEditor
              {...generateComponentEditorProperties<{ apiiroQl: string }>(
                valueComponents,
                valueComponent,
                index
              )}
              errors={errors?.filter(error => error.componentIndex === index)}
            />
          );
        })}
      </EditedComponentsContainer>
      {!readOnly && (
        <InterpolatedStringEditorSuggestionsPopover
          onInsertToken={handleInsertToken}
          disabled={
            focusedComponentIndex >= 0 &&
            typeof editedComponents[focusedComponentIndex]?.component !== 'string'
          }
          tokenSuggestionGenerators={tokenSuggestionGenerators}
        />
      )}
      {!readOnly && !isEmpty && <IconButton onClick={() => clearAllComponents()} name="Close" />}
    </FieldWrapper>
  );
});

const EditedComponentsContainer = styled.div`
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;

  margin: 0;
  padding: 0;

  overflow-x: auto;
`;

const FieldWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  height: 9rem;

  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: start;
  justify-items: start;
  align-items: center;
  gap: 1rem;

  padding: 1rem 3rem;

  color: var(--color-blue-gray-70);
  font-size: var(--font-size-s);
  font-weight: 400;
  background-color: var(--color-white);

  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 2rem;

  overflow-x: auto;

  &[data-readonly] {
    border: 0;
    padding: 0 3rem;
  }

  &:has(:focus) {
    border-color: var(--color-blue-65);
  }

  &[data-invalid] {
    border-color: var(--color-red-55);

    &:focus {
      border-color: var(--color-red-65);
    }
  }

  &:hover {
    border-color: var(--color-blue-gray-50);

    &[data-invalid] {
      border-color: var(--color-red-60);
    }
  }
`;
