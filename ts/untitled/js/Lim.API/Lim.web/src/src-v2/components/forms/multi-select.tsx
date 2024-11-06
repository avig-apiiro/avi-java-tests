import { useCombobox, useMultipleSelection } from 'downshift';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { FieldError } from 'react-hook-form/dist/types/errors';
import styled, { StyledProps } from 'styled-components';
import { Chip } from '@src-v2/components/chips';
import { Combobox } from '@src-v2/components/forms/combobox';
import { Input } from '@src-v2/components/forms/input';
import { creatableSymbol, defaultItemToString } from '@src-v2/hooks/use-downshift';
import { customScrollbar } from '@src-v2/style/mixins';
import { assignStyledNodes } from '@src-v2/types/styled';

type MultiSelectPropsType = {
  items: any;
  error: FieldError;
  disabled: boolean;
  itemToString: () => void;
  value: any[];
  selectedItems: any[];
  onSelect: () => void;
  chip: any;
  creatable: boolean;
  placeholder: string;
  onItemClick: () => void;
};

const _MultiSelect = forwardRef<HTMLDivElement, StyledProps<MultiSelectPropsType>>(
  (
    {
      items = [],
      error,
      disabled,
      itemToString = defaultItemToString,
      value: defaultSelectedItems = [],
      selectedItems: controlledItems,
      onSelect: onSelectedItemsChange,
      chip: ChipComponent = Chip,
      creatable,
      placeholder,
      onItemClick = null,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState('');
    const {
      selectedItems,
      addSelectedItem,
      removeSelectedItem,
      getSelectedItemProps,
      getDropdownProps,
    } = useMultipleSelection({
      defaultSelectedItems,
      onSelectedItemsChange,
      // must not define a key if the value is undefined
      ...(controlledItems && { selectedItems: controlledItems }),
    });

    const itemsFilter = useMemo(() => {
      const selectedStrings = selectedItems.map(itemToString);
      return item => {
        const itemString = itemToString(item);
        return selectedStrings.every(selectedString => itemString !== selectedString);
      };
    }, [selectedItems]);

    const handleStateChange = useCallback(
      ({ type, inputValue, selectedItem }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.InputChange:
            setInputValue(inputValue);
            break;
          case useCombobox.stateChangeTypes.InputBlur:
            if (selectedItem?.[creatableSymbol]) {
              addSelectedItem(selectedItem);
            }

            setInputValue('');
            break;
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            if (selectedItem) {
              if (selectedItem[creatableSymbol]) {
                setInputValue('');
              }

              addSelectedItem(selectedItem);
            }
            break;
          // no default
        }
      },
      [setInputValue, addSelectedItem]
    );

    return (
      <MultiSelect.Combobox
        {...props}
        ref={ref}
        items={items}
        error={error}
        selectedItem={null}
        disabled={disabled}
        creatable={creatable}
        inputValue={inputValue}
        defaultHighlightedIndex={0}
        itemToString={itemToString}
        getDropdownProps={getDropdownProps}
        onStateChange={handleStateChange}
        placeholder={placeholder}
        stateReducer={stateReducerGenerator(creatable)}
        itemsFilter={itemsFilter}>
        {selectedItems.map((selectedItem, index) => (
          <ChipComponent
            key={index}
            selectedItem={selectedItem}
            {...(!disabled &&
              getSelectedItemProps({
                index,
                selectedItem,
                onRemove: event => {
                  event.preventDefault();
                  event.stopPropagation();
                  removeSelectedItem(selectedItem);
                },
              }))}
            onClick={onItemClick}>
            {itemToString(selectedItem)}
          </ChipComponent>
        ))}
      </MultiSelect.Combobox>
    );
  }
);

const MultiSelectCombobox = styled(Combobox)`
  ${customScrollbar};
  &::-webkit-scrollbar-thumb {
    visibility: visible;
  }

  width: 100%;
  min-height: 9rem;
  max-height: 40rem;
  flex-wrap: wrap;
  padding: ${props => (props.creatable ? '1rem 0 1rem 2rem' : '1rem 6rem 1rem 2rem')};
  background-color: ${props =>
    props.disabled ? 'var(--color-blue-gray-15)' : 'var(--color-white)'};
  box-shadow: inset 0 0.5rem 0 var(--input-shadow-color);
  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 2rem;
  gap: 2rem;
  overflow: hidden scroll;

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

  ${Input} {
    width: fit-content;
    height: 5rem;
    padding: 0 1rem;
    line-height: 5rem;
    box-shadow: none;
    border: none;
    background-color: transparent;
    flex-grow: 1;
    order: 1;
    font-size: 14px;

    &::placeholder {
      color: var(--color-blue-gray-50);
    }
  }
`;

function stateReducerGenerator(creatable = false) {
  return function stateReducer(state, { changes, type }) {
    switch (type) {
      case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
        return { ...changes, inputValue: state.inputValue ?? changes.inputValue ?? '' };
      case useCombobox.stateChangeTypes.InputKeyDownEnter:
      case useCombobox.stateChangeTypes.ItemClick:
        return { ...changes, isOpen: !creatable, inputValue: state.inputValue ?? '' };

      case useCombobox.stateChangeTypes.FunctionSelectItem:
        return { ...changes, isOpen: false, inputValue: '' };
      case useCombobox.stateChangeTypes.InputBlur:
        return {
          ...changes,
          isOpen: false,
          inputClicked: false,
          inputValue: '',
          selectedItem:
            changes.selectedItem ??
            (creatable && changes.inputValue
              ? {
                  label: changes.inputValue,
                  value: changes.inputValue,
                  [creatableSymbol]: true,
                }
              : undefined),
        };
      case useCombobox.stateChangeTypes.InputClick:
        return {
          ...changes,
          isOpen: !changes.inputClicked,
          inputClicked: !changes.inputClicked,
        };
      default:
        return changes;
    }
  };
}

export const stateReducer = stateReducerGenerator();

export const MultiSelect = assignStyledNodes(_MultiSelect, {
  Combobox: MultiSelectCombobox,
});
