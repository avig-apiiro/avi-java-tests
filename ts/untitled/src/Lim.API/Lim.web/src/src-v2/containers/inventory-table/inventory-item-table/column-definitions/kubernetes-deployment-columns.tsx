import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { isInfrastructureTemplateLookingString } from '@src-v2/containers/inventory-table/inventory-utils';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const kubernetesDeploymentColumns: Column<StubAny>[] = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.name}</SimpleTextCell>
    ),
  },
  {
    key: 'image-column',
    label: 'Image',
    resizeable: true,

    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText
          tooltip={`${data.diffableEntity.image} ${
            isInfrastructureTemplateLookingString(data.diffableEntity.image)
              ? '- This value is expected to be altered dynamically during the deployment process'
              : ''
          }`}>
          {data.diffableEntity.name}
        </ClampText>
      </Table.Cell>
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
];
