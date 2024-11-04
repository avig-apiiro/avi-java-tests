import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { ErrorLayout } from '@src-v2/components/layout';
import { BusinessImpactPopover } from '@src-v2/components/risk/risk-popovers';
import { useRiskProfile } from '@src-v2/components/risk/risk-utils';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { TableHeader } from '@src-v2/components/table/table-header';
import { Size } from '@src-v2/components/types/enums/size';
import { Light } from '@src-v2/components/typography';
import { RiskIconCell } from '@src-v2/containers/risks/risks-common-cells';
import { useTable } from '@src-v2/hooks/use-table';
import { Pipeline, PipelineApplication } from '@src-v2/types/pipelines/pipelines-types';
import { humanize } from '@src-v2/utils/string-utils';

export const PipelineApplications = ({ pipeline }: { pipeline: Pipeline }) => {
  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  return (
    <Table>
      <TableHeader tableModel={tableModel} />
      <Table.Body>
        {!pipeline?.applications || pipeline?.applications?.length === 0 ? (
          <Table.EmptyMessage colSpan={tableColumns.length}>
            <ErrorLayout.NoResults data-contained />
          </Table.EmptyMessage>
        ) : (
          pipeline?.applications.map(secret => (
            <Table.Row key={secret.name}>
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
    label: 'Application name',
    Cell: ({ data, ...props }: { data: PipelineApplication }) => {
      const riskProfile = useRiskProfile(data);
      return (
        <Table.FlexCell {...props}>
          <TextButton
            size={Size.XSMALL}
            mode={LinkMode.EXTERNAL}
            to={`/profiles/applications/${data.key}`}>
            {data.name}
          </TextButton>
          {data.businessImpact && (
            <BusinessImpactPopover
              profile={{
                ...riskProfile,
                businessImpact: humanize(riskProfile.businessImpactLevel),
              }}>
              <BusinessImpactIndicator businessImpact={data.businessImpact} />
            </BusinessImpactPopover>
          )}
        </Table.FlexCell>
      );
    },
  },
  {
    label: 'Common repositories',
    Cell: ({ data, ...props }: { data: PipelineApplication }) => (
      <TrimmedCollectionCell
        {...props}
        item={({ value: commonRepo }) => (
          <Light>
            {commonRepo.name} ({commonRepo.branch} branch)
          </Light>
        )}>
        {data.commonRepositories}
      </TrimmedCollectionCell>
    ),
  },
  {
    width: '25rem',
    label: 'Risk',
    Cell: props => <RiskIconCell hasOverride={false} {...props} />,
  },
];
