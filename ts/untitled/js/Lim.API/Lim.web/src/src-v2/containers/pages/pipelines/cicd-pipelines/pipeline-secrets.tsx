import styled from 'styled-components';
import { ErrorLayout } from '@src-v2/components/layout';
import { Table } from '@src-v2/components/table/table';
import { TableHeader } from '@src-v2/components/table/table-header';
import { EllipsisText } from '@src-v2/components/typography';
import { useTable } from '@src-v2/hooks/use-table';
import { Pipeline, PipelineSecret } from '@src-v2/types/pipelines/pipelines-types';

export const PipelineSecrets = ({ pipeline }: { pipeline: Pipeline }) => {
  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  return (
    <Table>
      <TableHeader tableModel={tableModel} />
      <Table.Body>
        {!pipeline?.secrets || pipeline?.secrets?.length === 0 ? (
          <Table.EmptyMessage colSpan={tableColumns.length}>
            <ErrorLayout.NoResults data-contained />
          </Table.EmptyMessage>
        ) : (
          pipeline?.secrets.map(secret => (
            <Table.Row key={`${secret.name}-${secret.lineNumber}`}>
              {tableModel.columns?.map(({ Cell, ...column }) => (
                <Cell key={column.label} data={secret} />
              ))}
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table>
  );
};

export const tableColumns = [
  {
    label: 'Secret name',
    Cell: ({ data, ...props }: { data: PipelineSecret }) => (
      <Table.Cell {...props}>
        {Boolean(data.filePath) && (
          <SecretNamePath>
            {data.filePath}:line_{data.lineNumber}
          </SecretNamePath>
        )}
        {Boolean(data.name) && <SecretNameSecret>{data.name}</SecretNameSecret>}
      </Table.Cell>
    ),
  },
  {
    label: 'Exposure',
    Cell: ({ data, ...props }: { data: PipelineSecret }) => (
      <Table.Cell {...props}>{data.exposure}</Table.Cell>
    ),
  },
];

const SecretNamePath = styled(EllipsisText)`
  color: var(--color-blue-gray-65);
  font-size: var(--font-size-xs);
`;

const SecretNameSecret = styled(EllipsisText)`
  color: var(--color-blue-gray-70);
  font-size: var(--font-size-s);
`;
