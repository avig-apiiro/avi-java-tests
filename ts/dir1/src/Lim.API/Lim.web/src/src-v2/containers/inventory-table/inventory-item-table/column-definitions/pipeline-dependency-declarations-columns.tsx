import styled from 'styled-components';
import { ClampPath } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { EntityNameCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/common';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';
import { Table } from '@src/src-v2/components/table/table';

export const pipelineDependencyDeclarationsColumns: Column<StubAny>[] = [
  {
    key: 'name-column',
    label: 'Pipeline dependency name',
    resizeable: true,
    Cell: EntityNameCell,
  },
  {
    key: 'version-column',
    label: 'Version',
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.version}</SimpleTextCell>
    ),
  },
  {
    key: 'pipeline-column',
    label: 'Pipeline',
    resizeable: true,
    Cell: styled(
      ({ data: { diffableEntity }, ...props }: { data: { diffableEntity: StubAny } }) => (
        <Table.FlexCell {...props}>
          <VendorIcon name={diffableEntity.ciCdIacFramework ?? diffableEntity.dependencyType} />
          <ClampPath>{diffableEntity.cicdPipelineEntityId}</ClampPath>
        </Table.FlexCell>
      )
    )`
      gap: 1rem;
    `,
  },
];
