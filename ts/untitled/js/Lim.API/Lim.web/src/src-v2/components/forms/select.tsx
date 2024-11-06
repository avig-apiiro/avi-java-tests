import { useCombobox } from 'downshift';
import { FC, forwardRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Combobox } from '@src-v2/components/forms/combobox';
import { Input } from '@src-v2/components/forms/input';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { defaultItemToString, useForwardRef } from '@src-v2/hooks';
import { assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

interface _SelectProps<T = unknown> {
  placeholder: string;
  clearable?: boolean;
  searchable?: boolean;
  items?: T[];
  itemToString?: (item: T) => string;
  dropdownItem?: FC<{ item: T; creatable?: boolean }>;
  noSelectedPlaceholder?: boolean;
  onSelect?: (event) => void;
  onClear?: () => void;
  value?: T;
  disabled?: boolean;
}

const _Select = forwardRef<HTMLInputElement, _SelectProps>(
  (
    {
      placeholder,
      clearable = true,
      searchable = true,
      onSelect,
      onClear,
      noSelectedPlaceholder,
      itemToString = defaultItemToString,
      value,
      ...props
    },
    ref
  ) => {
    const [selectedItem, setSelectedItem] = useState(value ?? null);
    const innerRef = useForwardRef(ref ?? null);

    const handleClear = useCallback(() => {
      setSelectedItem(null);
      onClear?.();
    }, [onClear, selectedItem]);

    const handleSelect = useCallback(
      event => {
        if (event.selectedItem !== selectedItem) {
          setSelectedItem(event.selectedItem);
          onSelect?.(event);
        }
      },
      [onSelect, selectedItem]
    );

    const stateReducer = useCallback(
      (_state, { changes, type }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.FunctionSelectItem:
            return { ...changes, isOpen: false, inputValue: '' };
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            (innerRef.current as HTMLInputElement).blur(); // falls through
          case useCombobox.stateChangeTypes.InputBlur:
            return { ...changes, isOpen: false, inputValue: '', inputClicked: false };
          case useCombobox.stateChangeTypes.InputClick:
            return {
              ...changes,
              isOpen: !changes.inputClicked,
              inputClicked: !changes.inputClicked,
            };
          default:
            return changes;
        }
      },
      [innerRef]
    );

    return (
      <SelectCombobox
        {...props}
        ref={innerRef}
        clearable={clearable}
        readOnly={!searchable}
        selected={Boolean(selectedItem)}
        placeholder={
          noSelectedPlaceholder ? placeholder : itemToString(selectedItem) || placeholder
        }
        itemToString={itemToString}
        stateReducer={stateReducer}
        noSelectedPlaceholder={noSelectedPlaceholder}
        onSelect={handleSelect}>
        {({ getToggleButtonProps }) => (
          <>
            {selectedItem && clearable && (
              <ClearButton onClick={handleClear}>
                <SvgIcon name="Close" />
              </ClearButton>
            )}
            {clearable && <Divider />}
            <ToggleButton {...getToggleButtonProps()} data-disabled={dataAttr(props.disabled)}>
              <SvgIcon name="Chevron" />
            </ToggleButton>
          </>
        )}
      </SelectCombobox>
    );
  }
);

const Divider = styled.span`
  position: absolute;
  inset: 2rem 8rem 2rem auto;
  width: 0.25rem;
  height: 5rem;
  background-color: var(--color-blue-gray-25);
`;

const SelectIconButton = styled.span`
  position: absolute;
  color: var(--color-blue-gray-45);
  transition: color 400ms;
  cursor: pointer;

  &:hover {
    color: var(--color-blue-gray-65);
  }

  ${Input}:disabled ~ & {
    cursor: default;
  }

  ${Input}:focus ~ & {
    color: var(--color-blue-gray-75);
  }

  > ${BaseIcon} {
    height: 100%;
    transform: rotate(90deg);
  }
`;

const ClearButton = styled(SelectIconButton)`
  inset: 0 8rem 0 auto;
  padding: 0 1rem;

  ${Input}:disabled ~ & {
    display: none;
  }
`;

const ToggleButton = styled(SelectIconButton)`
  inset: 0 0 0 auto;
  padding: 0 1rem;
  transition: transform 0.2s ease-in-out;

  &[data-disabled] {
    display: none;
  }
`;

const SelectCombobox = styled(Combobox)`
  &[aria-expanded='true'] {
    ${ToggleButton} {
      transform: rotate(-180deg);
    }
  }

  > ${Combobox.InputContainer} > ${Input} {
    padding-right: ${props => (props.clearable ? '12rem' : '7.5rem')};
    cursor: ${props => (props.readOnly ? 'default' : 'auto')};

    ::placeholder {
      color: ${props =>
        props.selected && !props.noSelectedPlaceholder
          ? 'var(--color-blue-gray-70)'
          : 'var(--color-blue-gray-45)'};
    }

    :disabled::placeholder {
      color: var(--color-blue-gray-40);
    }
  }
`;

/**
 * @deprecated use <SelectV2 /> instead
 */
export const Select = assignStyledNodes(_Select, {
  SelectIconButton,
});
