import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { EntityNameCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/common';
import { InventoryInsightsCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/inventory-insights-cell';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { humanize } from '@src-v2/utils/string-utils';

export const dependencyDeclarationColumns = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: true,
    Cell: EntityNameCell,
  },
  {
    key: 'type-column',
    label: 'Type',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{humanize(data.diffableEntity.type, true)}</SimpleTextCell>
    ),
  },
  {
    key: 'scope-column',
    label: 'Scope',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.scope}</SimpleTextCell>
    ),
    betaFeature: FeatureFlag.ShowDependencyScopeInInventory,
  },
  {
    key: 'version-column',
    label: 'Version',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>
        {data.diffableEntity.resolvedVersion || data.diffableEntity.version}
      </SimpleTextCell>
    ),
  },
  {
    key: 'licenses-column',
    label: 'Licenses',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>{data.diffableEntity.licensesNames}</TrimmedCollectionCell>
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
