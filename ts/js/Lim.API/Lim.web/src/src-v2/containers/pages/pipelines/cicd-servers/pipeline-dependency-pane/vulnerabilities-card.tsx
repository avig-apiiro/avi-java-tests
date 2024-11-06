import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Table } from '@src-v2/components/table/table';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { LinesEllipsisText } from '@src-v2/components/typography';
import { usePipelineDependencyContext } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/pipeline-dependency-context-provider';
import { useTable } from '@src-v2/hooks/use-table';
import { CICDServerDependencyVulnerability } from '@src-v2/types/pipelines/pipelines-types';

export const VulnerabilitiesCards = (props: ControlledCardProps) => {
  const { serverDependencyInfo } = usePipelineDependencyContext();

  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  return (
    <ControlledCard
      {...props}
      title={`Vulnerabilities (${serverDependencyInfo.vulnerabilities?.length})`}>
      <CollapsibleTable tableModel={tableModel} items={serverDependencyInfo.vulnerabilities} />
    </ControlledCard>
  );
};

const tableColumns = [
  {
    label: 'ID',
    Cell: ({ data, ...props }: { data: CICDServerDependencyVulnerability }) => (
      <SimpleTextCell {...props}>{data.id}</SimpleTextCell>
    ),
    width: '40rem',
  },
  {
    label: 'Vulnerability',
    Cell: ({ data, ...props }: { data: CICDServerDependencyVulnerability }) => (
      <Table.Cell {...props}>
        <LinesEllipsisText lines={2}>{data.message}</LinesEllipsisText>
      </Table.Cell>
    ),
    width: '40rem',
  },
  {
    label: 'Vulnerable version',
    Cell: ({ data, ...props }: { data: CICDServerDependencyVulnerability }) => (
      <Table.Cell {...props}>
        {data.versionRanges?.map(version => (
          <VulnerableVersion>
            {version.firstVersion ? version.firstVersion : 'All versions'} -
            {version.lastVersion ? version.lastVersion : 'All versions'}
          </VulnerableVersion>
        ))}
      </Table.Cell>
    ),
  },
  {
    label: 'Source',
    Cell: ({ data, ...props }: { data: CICDServerDependencyVulnerability }) => (
      <Table.FlexCell {...props}>
        <>
          <Tooltip content={data.provider}>
            <VendorIcon name={data.provider} />
          </Tooltip>
          <Tooltip content={`View in ${data.provider}`}>
            <CircleButton href={data.url} size={Size.SMALL} variant={Variant.FLOATING}>
              <SvgIcon name="External" />
            </CircleButton>
          </Tooltip>
        </>
      </Table.FlexCell>
    ),
  },
];

const VulnerableVersion = styled.div``;
