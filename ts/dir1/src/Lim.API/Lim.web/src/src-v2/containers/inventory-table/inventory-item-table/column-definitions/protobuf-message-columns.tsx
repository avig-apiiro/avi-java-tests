import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { EntityNameCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/common';

export const protobufMessageColumns = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: true,
    Cell: EntityNameCell,
  },
  {
    key: 'members-column',
    label: 'Members',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>
        {data.diffableEntity.content
          .filter(field => field.kind === 'Field')
          .map(field => `${field.name}: ${field.type}`)}
      </TrimmedCollectionCell>
    ),
  },
];
