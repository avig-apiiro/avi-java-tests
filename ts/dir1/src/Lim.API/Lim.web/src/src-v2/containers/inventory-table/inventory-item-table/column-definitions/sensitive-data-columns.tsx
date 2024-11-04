import { ClampPath } from '@src-v2/components/clamp-text';
import {
  DoubleLinedCell,
  SimpleTextCell,
} from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { InventoryInsightsCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/inventory-insights-cell';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const sensitiveDataColumns: Column<StubAny>[] = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.name}</SimpleTextCell>
    ),
  },
  {
    key: 'introduced-through-column',
    label: 'Introduced through',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <ClampPath>{data.diffableEntity.codeReference.relativeFilePath}</ClampPath>
        <>{data.diffableEntity.codeReference.name}</>
      </DoubleLinedCell>
    ),
  },
  {
    key: 'type-column',
    label: 'Type',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>
        {data.diffableEntity.predictedAsDataModel ? 'Data Model Field' : 'Class Field'}
      </SimpleTextCell>
    ),
  },
  {
    key: 'data-types-column',
    label: 'Data Types',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>
        {data.diffableEntity.sensitiveDataTypes}
      </TrimmedCollectionCell>
    ),
  },
  {
    key: 'insights-column',
    label: 'Insights',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <InventoryInsightsCell insights={data.diffableEntity.insights} {...props} />
    ),
  },
];
