import { SvgIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const kubernetesServiceColumns: Column<StubAny>[] = [
  {
    key: 'icon-column',
    label: '',
    resizeable: true,
    Cell: ({ data, ...props }) => {
      return (
        <Table.Cell {...props}>
          {data.diffableEntity.exposureHintingType && (
            <Tooltip content="This service is accessible from outside the cluster">
              <SvgIcon name="Risk" />
            </Tooltip>
          )}
        </Table.Cell>
      );
    },
  },
  {
    key: 'name-column',
    label: 'Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.name}</SimpleTextCell>
    ),
  },
  {
    key: 'linked-deployments-column',
    label: 'Linked Deployments',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>
        {Object.values(data.diffableEntity.backingDeploymentsNamesById ?? {})}
      </TrimmedCollectionCell>
    ),
  },
  {
    key: 'ports-column',
    label: 'Ports',
    resizeable: true,

    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell<{ sourcePort: number; displayName: string }>
        {...props}
        item={({ value }) => <>{value.sourcePort}</>}
        excessiveItem={({ value }) => <>{value.displayName}</>}>
        {Object.values(data.diffableEntity.ports ?? {})}
      </TrimmedCollectionCell>
    ),
  },
  {
    key: 'type-column',
    label: 'Type',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.type}</SimpleTextCell>
    ),
  },
];
