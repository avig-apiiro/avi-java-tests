import { ClampPath } from '@src-v2/components/clamp-text';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { InventoryInsightsCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/inventory-insights-cell';

export const dataModelColumns = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <ClampPath>{data.diffableEntity.codeReference.relativeFilePath}</ClampPath>
        <>{data.diffableEntity.codeReference.name}</>
      </DoubleLinedCell>
    ),
  },
  {
    key: 'fields-column',
    label: 'Fields',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>{data.diffableEntity.fieldNames}</TrimmedCollectionCell>
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
