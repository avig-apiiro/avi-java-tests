import { ComponentProps, HTMLAttributes } from 'react';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';

export function TrimmedCollectionCell<T = string>({
  item,
  excessiveItem,
  children,
  tooltip,
  limitExcessiveItems,
  searchMethod,
  ...props
}: Omit<ComponentProps<typeof TrimmedCollectionDisplay<T>>, 'limit'> &
  Omit<HTMLAttributes<HTMLTableCellElement>, 'children'>) {
  return (
    <Table.FlexCell {...props}>
      <TrimmedCollectionDisplay<T>
        tooltip={tooltip}
        limit={1}
        item={item}
        excessiveItem={excessiveItem}
        limitExcessiveItems={limitExcessiveItems}
        searchMethod={searchMethod}>
        {children}
      </TrimmedCollectionDisplay>
    </Table.FlexCell>
  );
}
