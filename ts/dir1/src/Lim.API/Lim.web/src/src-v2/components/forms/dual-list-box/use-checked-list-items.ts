import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import {
  BaseListBoxItem,
  DualListBoxProps,
} from '@src-v2/components/forms/dual-list-box/dual-list-box';

export interface CheckedData<TItem> {
  items: Record<string, TItem>;
  toggleItem: (item: TItem) => void;
  isChecked: (item: TItem) => boolean;
  hasChecked: boolean;
  reset: () => void;
}

export function useCheckedListItems<TItem extends BaseListBoxItem>(
  keyBy?: DualListBoxProps<TItem>['keyBy']
): CheckedData<TItem> {
  const [items, setItems] = useState<CheckedData<TItem>['items']>({});
  const toggleItem = useCallback(
    (item: TItem) => {
      const itemKey = keyBy?.(item) ?? item.key;
      setItems(checkedValue => {
        if (checkedValue[itemKey]) {
          delete checkedValue[itemKey];
        } else {
          checkedValue[itemKey] = item;
        }

        return { ...checkedValue };
      });
    },
    [keyBy]
  );

  return {
    items,
    toggleItem,
    isChecked: useCallback(
      (item: TItem) => Boolean(items[keyBy?.(item) ?? item.key]),
      [items, keyBy]
    ),
    hasChecked: useMemo(() => !_.isEmpty(items), [items]),
    reset: useCallback(() => setItems({}), []),
  };
}
