import _ from 'lodash';
import { ClampPath } from '@src-v2/components/clamp-text';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { InventoryInsightsCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/inventory-insights-cell';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const terraformModuleHighlightsColumns: Column<StubAny>[] = [
  {
    key: 'modules-column',
    label: 'Modules',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <>
          {_.uniq(
            data.diffableEntity.resourcesSummary
              .map((resource: StubAny) => resource.type?.split('_')[0])
              .filter((resourceType: StubAny) =>
                ['google', 'aws', 'azurerm'].includes(resourceType)
              )
          ).join(', ')}
        </>
        <ClampPath>{data.diffableEntity.modulePath}</ClampPath>
      </DoubleLinedCell>
    ),
  },
  {
    key: 'categories-column',
    label: 'Categories',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>
        {Object.keys(
          _.groupBy(data.diffableEntity.resourcesSummary, resource => resource.iacCategory)
        ).filter(category => category !== 'Other')}
      </TrimmedCollectionCell>
    ),
  },
  {
    key: 'module-references-column',
    label: 'Module References',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>
        {_.uniq(
          data.diffableEntity.modules
            ?.map((module: StubAny) => module.module_directory_path)
            .concat(data.diffableEntity.externalModulesReferences)
        )}
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
