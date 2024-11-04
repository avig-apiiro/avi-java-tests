import { useMemo } from 'react';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { VendorIcon } from '@src-v2/components/icons';
import { PlainPaneTable } from '@src-v2/components/panes/plain-pane-table';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Table } from '@src-v2/components/table/table';
import { SeverityTag } from '@src-v2/components/tags';
import { Paragraph } from '@src-v2/components/typography';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { useInject } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useTable } from '@src-v2/hooks/use-table';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RelatedFinding } from '@src-v2/types/risks/risk-trigger-summary-response';
import { pluralFormat } from '@src-v2/utils/number-utils';

export const RelatedSastFindings = (props: ControlledCardProps) => {
  const { risk } = useApiPaneContext();
  const { application } = useInject();
  const isSmartTableOnRiskPaneEnabled = application.isFeatureEnabled(
    FeatureFlag.SmartTableOnRiskPane
  );

  const tableModel = useTable({ tableColumns, hasReorderColumns: false });

  const dependencyFindingsWithKey = useMemo(
    () =>
      risk.relatedFindings.map((finding, index) => ({
        key: `${finding.dataModelRelationType}-${index}`,
        ...finding,
      })),
    [risk.relatedFindings]
  );

  const clientTableModel = useClientDataTable<RelatedFinding & { key: string }>(
    dependencyFindingsWithKey,
    {
      key: 'relatedSastFinding',
      columns: tableColumns,
    }
  );

  if (!risk.relatedFindings?.length) {
    return null;
  }

  return (
    <ControlledCard {...props} title={`Related SAST findings (${risk.relatedFindings?.length})`}>
      <Paragraph>This API has related SAST findings that might be risky:</Paragraph>

      {isSmartTableOnRiskPaneEnabled ? (
        <PlainPaneTable
          dataModel={clientTableModel}
          itemName={pluralFormat(dependencyFindingsWithKey.length, 'related finding')}
        />
      ) : (
        <CollapsibleTable tableModel={tableModel} items={risk.relatedFindings} />
      )}
    </ControlledCard>
  );
};

const tableColumns = [
  {
    key: 'related-sast-finding-column',
    label: 'SAST finding',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <Table.Cell {...props}>{data.relatedFindingSummaryInfo.issueTitle}</Table.Cell>
    ),
  },
  {
    key: 'related-sast-path-column',
    label: 'Path',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => {
      const { relatedProfile } = useApiPaneContext();
      return (
        <Table.FlexCell {...props}>
          <CodeReferenceLink repository={relatedProfile} codeReference={data.codeReference} />
        </Table.FlexCell>
      );
    },
  },
  {
    key: 'related-sast-severity-column',
    label: 'Severity',
    width: '20rem',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <Table.FlexCell {...props}>
        <SeverityTag riskLevel={data.relatedFindingSummaryInfo.severity}>
          {data.relatedFindingSummaryInfo.severity}
        </SeverityTag>
      </Table.FlexCell>
    ),
  },
  {
    key: 'related-sast-source-column',
    label: 'Source',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <Table.Cell {...props}>
        <VendorIcon name={data.relatedFindingSummaryInfo.provider} />
      </Table.Cell>
    ),
    width: '20rem',
  },
];
