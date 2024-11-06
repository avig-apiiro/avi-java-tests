import _ from 'lodash';
import { FC, ReactNode, createContext, useContext } from 'react';
import {
  BaseListBoxItem,
  DualListBoxProps,
} from '@src-v2/components/forms/dual-list-box/dual-list-box';
import { CheckedData } from '@src-v2/components/forms/dual-list-box/use-checked-list-items';

type ListBoxDisplayContextType<TItem> = Pick<DualListBoxProps<TItem>, 'itemTypeDisplayName'> & {
  prefix: 'selected' | 'available';
  itemTypeDisplayName: ReactNode;
  footer: ReactNode;
  renderItem: FC<{ item: TItem }>;
  checkedData: CheckedData<TItem>;
};

const getListBoxDisplayContext = _.once(<TItem extends BaseListBoxItem>() =>
  createContext<ListBoxDisplayContextType<TItem>>(null)
);

export function ListBoxDisplayContext<TItem extends BaseListBoxItem>({
  children,
  ...value
}: ListBoxDisplayContextType<TItem> & {
  children: ReactNode;
}) {
  const Context = getListBoxDisplayContext<TItem>();

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useListBoxDisplayContext<TItem extends BaseListBoxItem>() {
  return useContext(getListBoxDisplayContext<TItem>());
}
