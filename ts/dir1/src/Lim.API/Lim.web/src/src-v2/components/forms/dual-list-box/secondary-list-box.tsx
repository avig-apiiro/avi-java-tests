import { observer } from 'mobx-react';
import { useMemo, useState } from 'react';
import {
  BaseListBoxItem,
  DualListBoxProps,
} from '@src-v2/components/forms/dual-list-box/dual-list-box';
import { ListBoxDisplay } from '@src-v2/components/forms/dual-list-box/list-box-display';

type SecondaryListBoxProps<TItem> = Pick<DualListBoxProps<TItem>, 'filterBy'> & {
  items: TItem[];
};

export const SecondaryListBox = observer(
  <TItem extends BaseListBoxItem>({ items = [], filterBy }: SecondaryListBoxProps<TItem>) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(
      () => items.filter(item => filterBy(item, searchTerm)),
      [items, searchTerm]
    );

    return (
      <ListBoxDisplay
        data-secondary
        total={items.length}
        count={filteredItems.length}
        debounceSearch={false}
        onSearch={setSearchTerm}>
        <ListBoxDisplay.Content items={filteredItems} />
      </ListBoxDisplay>
    );
  }
);
