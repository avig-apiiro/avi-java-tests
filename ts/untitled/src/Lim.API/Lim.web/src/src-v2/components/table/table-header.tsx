import { Table } from '@src-v2/components/table/table';
import { useColumnDrag } from '@src-v2/containers/data-table/utils/hooks';
import { Column } from '@src-v2/types/table';

export function TableHeader<T>({
  tableModel,
  ...props
}: {
  tableModel: {
    columns: Column<T>[];
    hasReorderColumns: boolean;
    moveColumn: ({ dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }) => void;
  };
  [_: string]: any;
}) {
  return (
    <Table.Head {...props}>
      <Table.Row>
        {tableModel.columns?.map((column, index) => (
          <HeaderContainer<T>
            key={column.key ?? (typeof column.label === 'string' ? column.label : index)}
            index={index}
            tableModel={tableModel}
            currentColumn={column}
          />
        ))}
      </Table.Row>
    </Table.Head>
  );
}

function HeaderContainer<T>({
  tableModel,
  currentColumn,
  index,
  ...props
}: {
  tableModel: {
    columns: Column<T>[];
    hasReorderColumns: boolean;
    moveColumn: ({ dragIndex, hoverIndex }) => void;
  };
  currentColumn: Column<T>;
  index: number;
  [_: string]: any;
}) {
  const { dragRef, dropRef } = useColumnDrag({
    onDrop: item => tableModel.moveColumn({ dragIndex: item.index, hoverIndex: index }),
    type: 'column',
    item: { index },
    canDrop: () => null,
  });

  return (
    <Table.Header
      {...props}
      ref={node => (tableModel.hasReorderColumns ? dragRef(dropRef(node)) : null)}
      key={
        currentColumn.key ?? (typeof currentColumn.label === 'string' ? currentColumn.label : index)
      }
      style={{
        width: currentColumn.width,
        minWidth: currentColumn.minWidth ?? currentColumn.width,
      }}>
      {currentColumn.label}
    </Table.Header>
  );
}
