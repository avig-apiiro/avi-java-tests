import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { EntityNameCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/common';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const gqlObjectColumns: Column<StubAny>[] = [
  {
    key: 'types-column',
    label: 'Types',
    resizeable: true,
    Cell: EntityNameCell,
  },
  {
    key: 'members-column',
    label: 'Members',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>
        {data.diffableEntity.fields.map((field: StubAny) => `${field.name}: ${field.type}`)}
      </TrimmedCollectionCell>
    ),
  },
];
