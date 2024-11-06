import { parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Dropdown } from '@src-v2/components/dropdown';
import { CalendarPicker } from '@src-v2/components/filters/inline-control/components/calendar-date-picker-filter-control';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { BaseIcon } from '@src-v2/components/icons';
import { hideCalendarOnClickCustomPlugin } from '@src-v2/components/risk/risk-due-date';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { SearchCombobox } from '@src-v2/containers/search-combobox';
import { dateFormats } from '@src-v2/data/datetime';
import { defaultItemToString, useFormatDate } from '@src-v2/hooks';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { HorizontalStack } from '@src/components/HorizontalStack';

export const PredicateArgumentSelect = function ({
  items,
  onItemSelected,
  value,
  highlighted = false,
  placeholder = null,
  itemToIcon = null,
  itemToString = defaultItemToString,
  readOnly = false,
}) {
  return (
    <PredicateSelectMenu
      data-highlighted={dataAttr(highlighted)}
      variant={Variant.FILTER}
      readOnly={readOnly}
      placeholder={
        value ? (
          <HorizontalStack>
            {itemToIcon?.(value)}
            {itemToString(value)}
          </HorizontalStack>
        ) : (
          placeholder || <>&nbsp;</>
        )
      }>
      {items.map((item, index) => (
        <Dropdown.Item
          data-selected={dataAttr(item === value)}
          onClick={() => onItemSelected(item)}
          key={index}>
          <HorizontalStack>
            {itemToIcon?.(item)}
            {itemToString(item)}
          </HorizontalStack>
        </Dropdown.Item>
      ))}
    </PredicateSelectMenu>
  );
};

export const PredicateExtensibleEnumSelect = function ({
  enumItems,
  onChange,
  value,
  allowCustom,
  customOptionLabel = 'Custom...',
  highlighted = false,
  readOnly = false,
}) {
  const enumOptionItems = useMemo(
    () =>
      enumItems
        .map(itemString => ({ label: itemString, isCustomValueItem: false }))
        .concat(allowCustom ? [{ label: customOptionLabel, isCustomValueItem: true }] : []),
    [enumItems]
  );

  const [selectedEnumValue, setSelectedEnumValue] = useState<{
    label: string;
    isCustomValueItem: boolean;
  }>();

  useEffect(
    () =>
      setSelectedEnumValue(
        enumOptionItems.find(item => item.label === value || item.isCustomValueItem)
      ),
    [value, enumOptionItems]
  );

  return (
    <>
      <PredicateArgumentSelect
        value={selectedEnumValue}
        items={enumOptionItems}
        itemToString={item => item.label}
        readOnly={readOnly}
        onItemSelected={selectedEnum => {
          setSelectedEnumValue(selectedEnum);

          if (!selectedEnum.isCustomValueItem) {
            onChange(selectedEnum.label);
          }
        }}
        highlighted={highlighted}
      />
      {selectedEnumValue?.isCustomValueItem && (
        <PredicateArgumentInput
          value={value}
          onChange={event => onChange(event.target.value)}
          readOnly={readOnly}
          data-highlighted={dataAttr(highlighted)}
        />
      )}
    </>
  );
};

export const PredicateArgumentInput = styled.input`
  color: var(--default-text-color);
  border: solid 0.25rem var(--color-blue-gray-30);
  border-radius: 2rem;
  font-size: 3.5rem;
  height: 8rem;
  padding: 2rem 3rem;

  &[data-highlighted] {
    color: var(--color-blue-65);
  }
`;

export const PredicateArgumentDatePicker = ({
  value: defaultValue,
  highlighted,
  onChange,
}: {
  value: string;
  highlighted?: boolean;
  onChange: (value: string) => void;
}) => {
  const value = useMemo(() => {
    if (!defaultValue) {
      return new Date();
    }

    try {
      const parsedValue = parseISO(defaultValue);
      return isNaN(parsedValue?.getTime()) ? new Date() : parsedValue;
    } catch {
      return new Date();
    }
  }, [defaultValue]);

  const handleChange = useCallback(
    (date: Date) => onChange(date?.toISOString() ?? null),
    [onChange]
  );

  return (
    <PredicateSelectMenu
      variant={Variant.FILTER}
      data-highlighted={dataAttr(highlighted)}
      plugins={[hideCalendarOnClickCustomPlugin]}
      placeholder={useFormatDate(value, dateFormats.longDate)}
      maxHeight="100%">
      <CalendarPicker selectRange={false} value={value} onChange={handleChange} />
    </PredicateSelectMenu>
  );
};

export const PredicateSelectMenu = styled(SelectMenu)`
  &[data-highlighted] {
    color: var(--color-blue-65);
  }

  border-radius: 2rem;
`;

export const PredicateChipMultiSelect = styled(props => (
  <SearchCombobox as={MultiSelect} {...props} />
))`
  color: var(--default-text-color);
  border: solid 0.25rem var(--color-blue-gray-30);
  border-radius: 2rem;
  font-size: 3.5rem;
  min-height: 8rem;
  min-width: 65rem;
  padding: 0 1rem;

  &:focus-within {
    border: solid 0.25rem var(--color-blue-gray-30);
  }

  ${BaseIcon}[data-name="Chevron"] {
    transform: rotate(90deg);
  }
`;
