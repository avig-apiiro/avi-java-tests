import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { Link } from '@src-v2/components/typography';
import { InventoryInsightsCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/inventory-insights-cell';
import { getRepository } from '@src-v2/containers/inventory-table/inventory-utils';
import { InvolvedModule } from '@src-v2/types/inventory-elements/docker-file-element';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export function createDockerfileColumns(profile: any): Column<StubAny>[] {
  return [
    {
      key: 'file-path-column',
      label: 'Docker Filepath',
      resizeable: true,
      Cell: ({ data, ...props }) => (
        <SimpleTextCell {...props}>{data.diffableEntity.filePath}</SimpleTextCell>
      ),
    },
    {
      key: 'involved-modules-column',
      label: 'Involved Modules',
      resizeable: true,
      Cell: ({ data, ...props }) => {
        return (
          <TrimmedCollectionCell<InvolvedModule>
            {...props}
            item={({ value: module }) => (
              <Link
                onClick={e => e.stopPropagation()}
                to={`/module/${getRepository({ profile, data }).key}/${encodeURIComponent(
                  module.root
                )}`}>
                {module.name}
              </Link>
            )}>
            {data.diffableEntity.involvedModules}
          </TrimmedCollectionCell>
        );
      },
    },
    {
      key: 'base-images-column',
      label: 'Base Images',
      resizeable: true,
      Cell: ({ data, ...props }) => (
        <TrimmedCollectionCell {...props}>
          {data.diffableEntity.baseDockerImages}
        </TrimmedCollectionCell>
      ),
    },
    {
      key: 'related-images-column',
      label: 'Related Image Names',
      resizeable: true,
      Cell: ({ data, ...props }) => (
        <TrimmedCollectionCell {...props}>
          {data.diffableEntity.relatedDockerImageNames}
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
}
