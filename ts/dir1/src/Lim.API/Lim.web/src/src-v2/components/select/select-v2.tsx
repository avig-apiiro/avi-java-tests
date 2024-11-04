import { useMemo } from 'react';
import Select from 'react-select';
import { AsyncPaginate, withAsyncPaginate, wrapMenuList } from 'react-select-async-paginate';
import CreatableSelect from 'react-select/creatable';
import { GroupBase } from 'react-select/dist/declarations/src/types';
import { StyledComponent } from 'styled-components';
import { selectComponents } from '@src-v2/components/select/select-components';
import {
  AsyncSelectProps,
  CreatableSelectProps,
  SelectProps,
} from '@src-v2/components/select/select-props';
import { useLoadOptions } from '@src-v2/components/select/use-load-options';
import { useMergeCommonSelectProps } from '@src-v2/components/select/use-merge-common-select-props';
import { SearchParams } from '@src-v2/services';
import { assignStyledNodes } from '@src-v2/types/styled';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export type SelectV2Props<
  TOption,
  TMulti extends boolean,
  TGroup extends GroupBase<TOption> = GroupBase<TOption>,
> = SelectProps<TOption, TMulti, TGroup> &
  (CreatableSelectProps<TOption, TGroup> | AsyncSelectProps<TOption, TGroup>);

function _SelectV2<
  TOption,
  TMulti extends boolean = false,
  TGroup extends GroupBase<TOption> = GroupBase<TOption>,
>(props: SelectV2Props<TOption, TMulti, TGroup>) {
  if (isTypeOf<CreatableSelectProps<TOption, TGroup>>(props, 'creatable') && props.creatable) {
    if (isTypeOf<AsyncSelectProps<TOption, TGroup>>(props, 'searchMethod')) {
      return <AsyncSelectWrapper<TOption, TMulti, TGroup> {...props} />;
    }

    return <CreatableWrapper<TOption, TMulti, TGroup> {...props} />;
  }

  if (isTypeOf<AsyncSelectProps<TOption, TGroup>>(props, 'searchMethod')) {
    return <AsyncSelectWrapper<TOption, TMulti, TGroup> {...props} />;
  }

  return <SelectWrapper<TOption, TMulti, TGroup> {...props} />;
}

const AsyncMenuList = wrapMenuList(selectComponents.MenuList);

const AsyncPaginatedCreatableSelect = withAsyncPaginate(CreatableSelect);

function CreatableWrapper<
  TOption,
  TMulti extends boolean,
  TGroup extends GroupBase<TOption> = GroupBase<TOption>,
>({
  innerRef,
  ...props
}: SelectProps<TOption, TMulti, TGroup> & CreatableSelectProps<TOption, TGroup>) {
  const commonProps = useMergeCommonSelectProps<TOption, TMulti, TGroup>(props);

  return (
    <CreatableSelect<TOption, TMulti, TGroup>
      ref={innerRef}
      components={selectComponents}
      {...commonProps}
    />
  );
}

function AsyncSelectWrapper<
  TOption,
  TMulti extends boolean,
  TGroup extends GroupBase<TOption> = GroupBase<TOption>,
>({
  innerRef,
  searchMethod,
  searchParams = {},
  ...props
}: SelectProps<TOption, TMulti, TGroup> &
  (
    | AsyncSelectProps<TOption, TGroup>
    | (AsyncSelectProps<TOption, TGroup> & CreatableSelectProps<TOption, TGroup>)
  )) {
  const asyncComponents = useMemo(() => ({ ...selectComponents, MenuList: AsyncMenuList }), []);

  const commonProps = useMergeCommonSelectProps<TOption, TMulti, TGroup>(props);
  const loadOptions = useLoadOptions<TOption, TGroup>(searchMethod);

  if (isTypeOf<CreatableSelectProps<TOption, TGroup>>(props, 'creatable') && props.creatable) {
    return (
      <AsyncPaginatedCreatableSelect<TOption, TGroup, Partial<SearchParams>, TMulti>
        selectRef={innerRef}
        {...commonProps}
        defaultOptions
        debounceTimeout={200}
        cacheUniqs={[loadOptions]}
        loadOptions={loadOptions}
        additional={searchParams}
        components={asyncComponents}
      />
    );
  }

  return (
    <AsyncPaginate
      selectRef={innerRef}
      {...commonProps}
      defaultOptions
      debounceTimeout={200}
      cacheUniqs={[loadOptions]}
      loadOptions={loadOptions}
      additional={searchParams}
      components={asyncComponents}
    />
  );
}

function SelectWrapper<
  TOption,
  TMulti extends boolean,
  TGroup extends GroupBase<TOption> = GroupBase<TOption>,
>({ innerRef, ...props }: SelectProps<TOption, TMulti, TGroup>) {
  const commonProps = useMergeCommonSelectProps<TOption, TMulti, TGroup>(props);

  return (
    <Select<TOption, TMulti, TGroup>
      ref={innerRef}
      components={selectComponents}
      {...commonProps}
    />
  );
}

export const SelectV2 = assignStyledNodes(_SelectV2, {
  Container: selectComponents.SelectContainer as StyledComponent<'div', any>,
});
