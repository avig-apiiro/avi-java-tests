import { ComponentType, LegacyRef } from 'react';
import Select from 'react-select';
import type {} from 'react-select/base';
import { GroupBase, OptionsOrGroups } from 'react-select/dist/declarations/src/types';
import { AsyncAdditionalProps } from 'react-select/dist/declarations/src/useAsync';
import { CreatableAdditionalProps } from 'react-select/dist/declarations/src/useCreatable';
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager';
import { selectComponents } from '@src-v2/components/select/select-components';
import { Size } from '@src-v2/components/types/enums/size';
import { SearchParams } from '@src-v2/services';
import { AggregationResult } from '@src-v2/types/aggregation-result';

export type OptionBase = { disabled?: boolean };

type ReactSelectBaseProps<
  TOption,
  TMulti extends boolean,
  TGroup extends GroupBase<TOption>,
> = Pick<
  StateManagerProps<TOption, TMulti, TGroup>,
  | 'autoFocus'
  | 'className'
  | 'defaultValue'
  | 'defaultInputValue'
  | 'defaultMenuIsOpen'
  | 'filterOption'
  | 'formatOptionLabel'
  | 'formatGroupLabel'
  | 'getOptionValue'
  | 'getOptionLabel'
  | 'hideSelectedOptions'
  | 'isOptionDisabled',
  | 'loadingMessage'
  | 'placeholder'
  | 'openMenuOnClick'
  | 'options'
  | 'onBlur'
  | 'onChange'
  | 'onFocus'
  | 'onInputChange'
  | 'onMenuOpen'
  | 'onMenuClose'
  | 'value'
>;

type CommonSelectProps<TOption, TMulti extends boolean, TGroup extends GroupBase<TOption>> = {
  multiple?: TMulti;
  clearable?: boolean;
  creatable?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  fitMenuToContent?: boolean;
  appendTo?: StateManagerProps<TOption, TMulti, TGroup>['menuPortalTarget'] | 'parent';
  option?: ComponentType<{ data: TOption }>;
  label?: ComponentType<{ data: TOption }>;
  size?: Size.SMALL | Size.MEDIUM;
  invalid?: boolean | string;
  container?: typeof selectComponents.SelectContainer;
  innerRef?: LegacyRef<Select<TOption, TMulti, TGroup>>;
  keyBy?: keyof TOption | ((option: TOption) => string);
} & ReactSelectBaseProps<TOption, TMulti, TGroup>;

export type SelectProps<
  TOption,
  TMulti extends boolean,
  TGroup extends GroupBase<TOption>,
> = CommonSelectProps<TOption, TMulti, TGroup>;

export type CreatableSelectProps<TOption, TGroup extends GroupBase<TOption>> = {
  creatable: true;
} & CreatableAdditionalProps<TOption, TGroup>;

export type AsyncSelectProps<TOption, TGroup extends GroupBase<TOption>> = {
  loading?: boolean;
  searchParams?: Partial<SearchParams>;
  searchMethod: (
    searchParams: Partial<SearchParams>
  ) => Promise<OptionsOrGroups<TOption, TGroup> | AggregationResult<TOption | TGroup>>;
} & AsyncAdditionalProps<TOption, TGroup>;

// This allows us to pass custom props into our components (by using `selectProps`),
// see documentation here: https://react-select.com/typescript#custom-select-props
declare module 'react-select/base' {
  export interface Props<Option, IsMulti extends boolean, Group extends GroupBase<Option>>
    extends Pick<
      CommonSelectProps<Option, IsMulti, Group>,
      'size' | 'invalid' | 'option' | 'label'
    > {}
}
