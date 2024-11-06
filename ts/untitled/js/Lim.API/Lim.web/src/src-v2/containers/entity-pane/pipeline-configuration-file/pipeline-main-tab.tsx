import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ClampText } from '@src-v2/components/clamp-text';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { ExternalLink, Light, Paragraph } from '@src-v2/components/typography';
import { usePipelinePaneContext } from '@src-v2/containers/entity-pane/pipeline-configuration-file/pipeline-entity-pane';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { useTable } from '@src-v2/hooks/use-table';
import {
  CicdPipelineDependencyDeclarationElement,
  PipelineDependencyDeclarations,
} from '@src-v2/types/inventory-elements/pipeline-configuration-file-element';

export function PipelineMainTab(props: ControlledCardProps) {
  return (
    <>
      <AboutPipelineCard {...props} />
      <PipelineDependenciesCard {...props} />
    </>
  );
}

function AboutPipelineCard(props: ControlledCardProps) {
  const { element } = usePipelinePaneContext();
  return (
    <ControlledCard {...props} title="About this pipeline">
      <EvidenceLine label="File name">
        {getFileName(
          _.first(
            element.codeReferences?.map(codeReference => codeReference.relativeFilePath) ??
              element.relativePath
          )
        )}
      </EvidenceLine>
      <EvidenceLine label="Insights">
        <ElementInsights insights={element.insights} />
      </EvidenceLine>
    </ControlledCard>
  );
}

const ComponentCell = styled(
  ({
    data: {
      codeReference: { relativeFilePath },
      name,
    },
    ...props
  }: {
    data: PipelineDependencyDeclarations;
  }) => {
    return (
      <Table.FlexCell {...props}>
        <ComponentCellContainer>
          <Light>
            <ClampText>{relativeFilePath}</ClampText>
          </Light>
          <ClampText>{name}</ClampText>
        </ComponentCellContainer>
      </Table.FlexCell>
    );
  }
)`
  ${Table.Cell} & {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 0;
  }
`;
const ComponentCellContainer = styled.div`
  width: 100%;
`;

const tableColumns = [
  {
    label: 'Pipeline dependency name',
    key: 'pipeline-dependency-name',
    Cell: ComponentCell,
    width: '80rem',
  },
  {
    label: 'Used in line',
    key: 'used-in-line',
    Cell: ({
      data: {
        codeReference: { relativeFilePath, lastLineInFile },
        lines,
      },
      ...props
    }: {
      data: PipelineDependencyDeclarations;
    }) => {
      const { relatedProfile } = usePipelinePaneContext();
      return (
        <TrimmedCollectionCell {...props}>
          {lines.map(lineNumber => (
            <ExternalLink
              key={lineNumber}
              href={generateCodeReferenceUrl(relatedProfile, {
                relativeFilePath,
                lineNumber,
                lastLineInFile,
              })}>{`Line ${lineNumber}`}</ExternalLink>
          ))}
        </TrimmedCollectionCell>
      );
    },
    width: '40rem',
  },
  {
    label: 'Version',
    key: 'version',
    Cell: ({ data: { version }, ...props }: { data: PipelineDependencyDeclarations }) => (
      <Table.Cell {...props}>
        <ClampText>{version ?? ''}</ClampText>
      </Table.Cell>
    ),
    width: '35rem',
  },
];

const prepareCicdPipelineDependencyDeclarationsTable = (
  cicdPipelineDependencyDeclarations: CicdPipelineDependencyDeclarationElement[]
) => {
  return cicdPipelineDependencyDeclarations.reduce(
    (acc: PipelineDependencyDeclarations[], dependency) => {
      const existingPipelineDependencyEntry = acc.find(
        entry =>
          entry.codeReference.relativeFilePath === dependency.codeReference.relativeFilePath &&
          entry.version === dependency.version &&
          entry.name === dependency.displayName
      );
      if (existingPipelineDependencyEntry) {
        existingPipelineDependencyEntry.lines.push(dependency.codeReference.lineNumber);
      } else {
        acc.push({
          id: dependency.cicdPipelineEntityId,
          version: dependency.version,
          lines: [dependency.codeReference.lineNumber],
          codeReference: {
            relativeFilePath: dependency.codeReference.relativeFilePath,
            lastLineInFile: dependency.codeReference.lastLineInFile,
          },
          name: dependency.displayName,
        });
      }
      return acc;
    },
    [] as PipelineDependencyDeclarations[]
  );
};

const PipelineDependenciesCard = (props: ControlledCardProps) => {
  const { element } = usePipelinePaneContext();
  const cicdPipelineDependencyDeclarationsTable = useMemo(
    () =>
      prepareCicdPipelineDependencyDeclarationsTable(element.cicdPipelineDependencyDeclarations),
    [element.cicdPipelineDependencyDeclarations]
  );
  const dependenciesCount = cicdPipelineDependencyDeclarationsTable?.length;
  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });
  return (
    <ControlledCard {...props} title={`Related pipeline dependencies (${dependenciesCount})`}>
      {dependenciesCount > 0 ? (
        <CollapsibleTable tableModel={tableModel} items={cicdPipelineDependencyDeclarationsTable} />
      ) : (
        <EmptyMessage>No pipeline dependencies identified</EmptyMessage>
      )}
    </ControlledCard>
  );
};

function getFileName(relativePath: string) {
  return relativePath?.split(/([\\/])/g).pop();
}

const EmptyMessage = styled(Paragraph)`
  width: 100%;
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
`;
