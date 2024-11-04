import { useCallback, useMemo } from 'react';
import { CSSObjectWithLabel } from 'react-select';
import { GroupBase } from 'react-select/dist/declarations/src/types';
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager';
import { CommonSelectProps, OptionBase } from '@src-v2/components/select/select-props';
import { Size } from '@src-v2/components/types/enums/size';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export function defaultIsOptionDisabled<TOption>(option: TOption) {
  return isTypeOf<OptionBase>(option, 'disabled') && option.disabled;
}

export function useMergeCommonSelectProps<
  TOption,
  TMulti extends boolean,
  TGroup extends GroupBase<TOption> = GroupBase<TOption>,
>({
  appendTo = document.body,
  invalid,
  size = Size.MEDIUM,
  multiple,
  clearable = true,
  searchable,
  fitMenuToContent,
  disabled,
  keyBy,
  isOptionDisabled = defaultIsOptionDisabled,
  ...props
}: CommonSelectProps<TOption, TMulti, TGroup>): StateManagerProps<TOption, TMulti, TGroup> {
  const getOptionValue = useCallback(
    (option: TOption) => {
      if (keyBy) {
        return typeof keyBy === 'function' ? keyBy(option) : option[keyBy]?.toString();
      }

      return typeof option === 'string'
        ? option
        : (option as { key: string })?.key ??
            (
              option as {
                value: string;
              }
            )?.value;
    },
    [keyBy]
  );

  return useMemo(
    () => ({
      ...props,
      unstyled: true,
      menuPlacement: 'auto',
      menuPosition: 'fixed',
      menuPortalTarget: appendTo === 'parent' ? props.innerRef?.current : appendTo,
      closeMenuOnSelect: !multiple,
      blurInputOnSelect: !multiple,
      formatGroupLabel: () => null,
      invalid,
      isMulti: multiple,
      isClearable: clearable,
      isDisabled: disabled,
      isSearchable: searchable,
      isOptionDisabled,
      getOptionValue,
      styles: {
        menuPortal: (provided: CSSObjectWithLabel) => ({ ...provided, zIndex: 20 }),
        menu: (provided: CSSObjectWithLabel) => ({
          ...provided,
          width: fitMenuToContent ? 'max-content' : provided.width,
        }),
      },
    }),
    [invalid, multiple, clearable, getOptionValue, props]
  );
}
