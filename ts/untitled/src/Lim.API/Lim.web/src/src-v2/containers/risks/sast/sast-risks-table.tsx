import { observer } from 'mobx-react';
import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { ExternalLink } from '@src-v2/components/typography';
import { groupingColumnsMapper } from '@src-v2/containers/risks/groupings/grouping-table-content';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksGrouping } from '@src-v2/containers/risks/risks-grouping';
import { RisksTable } from '@src-v2/containers/risks/risks-table';
import { useInject, useQueryParams } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useDataTableGrouping } from '@src-v2/hooks/use-data-table-grouping';
import { useFilters } from '@src-v2/hooks/use-filters';
import { ComplianceFrameworkReference } from '@src-v2/types/inventory-elements/code-findings';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { SastRiskTriggerSummary } from '@src-v2/types/risks/risk-types/sast-risk-trigger-summary';
import { Column } from '@src-v2/types/table';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { tableColumns } from '../all-risks/all-risks-table-content';

const SastRisksContent = observer(() => {
  const { session } = useInject();
  const { risksService } = useRisksContext();

  const {
    activeFilters: { searchTerm, ...filters },
  } = useFilters();

  const dataModel = useDataTable(
    risksService.searchRisks,
    {
      key: `${session?.data?.environmentId}-sast-risks`,
      columns: sastTableColumns(),
      selectable: true,
      searchParams: { path: 'risk/sast', filters },
    },
    risksService.getTotalCount,
    risksService.getFilteredCount
  );

  return <RisksTable dataModel={dataModel} />;
});

export const SastRisksGrouping = observer(() => {
  const { session, sastRisks } = useInject();
  const { queryParams } = useQueryParams();
  const groupBy = String(queryParams.group);

  const dataGroupingModel = useDataTableGrouping(sastRisks.searchGroupingRisks, {
    key: `${session?.data?.environmentId}-sast-risks-${groupBy}`,
    columns: groupingColumnsMapper[groupBy as keyof typeof groupingColumnsMapper],
    groupBy,
  });

  return <RisksGrouping dataGroupingModel={dataGroupingModel} />;
});

export const SastRisksTable = observer(() => {
  const { queryParams } = useQueryParams();

  return queryParams.group ? <SastRisksGrouping /> : <SastRisksContent />;
});

const ComplianceData = ({
  compliance,
  withClampText = true,
}: {
  compliance: ComplianceFrameworkReference;
  withClampText?: boolean;
}) => {
  const { url, securityComplianceFramework, identifier, description } = compliance;
  return (
    <ComplianceDataWrapper>
      <ExternalLinkWrapper
        onClick={stopPropagation}
        key={`${securityComplianceFramework}-${identifier}`}
        href={url}>
        {securityComplianceFramework.toUpperCase()}-{identifier}
      </ExternalLinkWrapper>
      {withClampText ? <ClampText>{description}</ClampText> : <>{description}</>}
    </ComplianceDataWrapper>
  );
};

const ComplianceDataWrapper = styled.div`
  display: flex;
  max-width: 90%;
  width: 100%;
`;

const ExternalLinkWrapper = styled(ExternalLink)`
  margin-right: 1rem;
  flex-shrink: 0;
`;

export const sastTableColumns = (): Column<RiskTriggerSummaryResponse>[] => {
  const newColumns = [...tableColumns];
  const complianceStandard: Column<SastRiskTriggerSummary> = {
    key: 'compliance-standard',
    label: 'Compliance standard',
    fieldName: 'complianceFrameworkReferences',
    width: '80rem',
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell<ComplianceFrameworkReference>
        {...props}
        item={({ value }) => <ComplianceData withClampText compliance={value} />}
        excessiveItem={({ value }) => <ComplianceData compliance={value} />}>
        {data.complianceFrameworkReferences}
      </TrimmedCollectionCell>
    ),
  };

  const findingName: Column<SastRiskTriggerSummary> = {
    key: 'finding-name',
    label: 'Finding name',
    fieldName: 'issueTitle',
    width: '50rem',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText>{data.issueTitle}</ClampText>
      </Table.Cell>
    ),
  };

  const findingType: Column<SastRiskTriggerSummary> = {
    key: 'finding-type',
    label: 'Finding type',
    fieldName: 'findingType',
    hidden: true,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText>{data.externalType}</ClampText>
      </Table.Cell>
    ),
  };

  newColumns.splice(4, 0, complianceStandard, findingName);
  newColumns.push(findingType);
  return newColumns;
};
