import { ClampPath } from '@src-v2/components/clamp-text';
import { ErrorLayout } from '@src-v2/components/layout';
import { Table } from '@src-v2/components/table/table';
import { InsightsCell } from '@src-v2/components/table/table-common-cells/insights-cell';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { TableHeader } from '@src-v2/components/table/table-header';
import { ExternalLink } from '@src-v2/components/typography';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { useTable } from '@src-v2/hooks/use-table';
import { PipelineDependencyDeclarations } from '@src-v2/types/inventory-elements/pipeline-configuration-file-element';

export const PipelineDependencies = ({
  pipelineDependencyTable,
}: {
  pipelineDependencyTable: PipelineDependencyDeclarations[];
}) => {
  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  return (
    <Table>
      <TableHeader tableModel={tableModel} />
      <Table.Body>
        {pipelineDependencyTable.length === 0 ? (
          <Table.EmptyMessage colSpan={tableColumns.length}>
            <ErrorLayout.NoResults data-contained />
          </Table.EmptyMessage>
        ) : (
          pipelineDependencyTable.map((dependency, index) => (
            <Table.Row key={`${dependency.name} -${index}`}>
              {tableModel.columns?.map(({ Cell, ...column }) => (
                <Cell key={`${column.label}-${dependency.name}`} data={dependency} />
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
    label: 'Pipeline dependency name',
    Cell: ({ data, ...props }: { data: PipelineDependencyDeclarations }) => (
      <DoubleLinedCell {...props}>
        <ClampPath>{data.codeReference.relativeFilePath}</ClampPath>
        {data.name}
      </DoubleLinedCell>
    ),
    width: '100rem',
  },
  {
    label: 'Used in line',
    Cell: ({ data, ...props }: { data: PipelineDependencyDeclarations }) => {
      const { lines, relatedProfile, codeReference } = data;
      return (
        <TrimmedCollectionCell {...props}>
          {lines.map(lineNumber => (
            <ExternalLink
              key={lineNumber}
              href={generateCodeReferenceUrl(relatedProfile, {
                relativeFilePath: codeReference.relativeFilePath,
                lineNumber,
                lastLineInFile: codeReference.lastLineInFile,
              })}>{`Line ${lineNumber}`}</ExternalLink>
          ))}
        </TrimmedCollectionCell>
      );
    },
    width: '80rem',
  },
  {
    label: 'Version',
    Cell: ({ data, ...props }: { data: PipelineDependencyDeclarations }) => (
      <Table.FlexCell {...props}>{data.version}</Table.FlexCell>
    ),
    width: '50rem',
  },
  {
    label: 'Insights',
    Cell: InsightsCell,
  },
];
