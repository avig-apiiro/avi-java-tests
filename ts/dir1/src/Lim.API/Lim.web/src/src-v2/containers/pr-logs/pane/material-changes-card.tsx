import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ControlledCard } from '@src-v2/components/cards/controlled-card';
import { PlainFiltersControls } from '@src-v2/components/filters/inline-control/containers/plain-filter-controls';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Table } from '@src-v2/components/table/table';
import { ExternalLink, Heading, Paragraph } from '@src-v2/components/typography';
import { MaterialChangesRow } from '@src-v2/containers/commit/common-componnets';
import { MaterialChangeFactory } from '@src-v2/containers/commit/material-changes/material-changes-content/material-changes-factory';
import { usePullRequestScanContext } from '@src-v2/containers/pr-logs/pane/pr-scan-context-provider';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { Filter, useLocalFilters } from '@src-v2/hooks/use-filters';
import { PullRequestMaterialChangesSummary } from '@src-v2/types/pull-request/pull-request-response';
import { StyledProps } from '@src-v2/types/styled';
import { Column } from '@src-v2/types/table';
import { entries } from '@src-v2/utils/ts-utils';
import { riskOrder } from '@src/services/riskService';

export function MaterialChangesCard() {
  return (
    <ControlledCard triggerOpenState={{ isOpen: true }} title="Material changes">
      <AsyncBoundary>
        <CardContent />
      </AsyncBoundary>
    </ControlledCard>
  );
}

const MATERIAL_CHANGES_TYPE_FILTER_KEY = 'MATERIAL_CHANGES_TYPE_FILTER_KEY';

function createLabelsFilterOption(
  orderedMaterialChangesSummaries: PullRequestMaterialChangesSummary[]
): Filter {
  const labelToMaterialChanges = _.groupBy(orderedMaterialChangesSummaries, 'label');
  return {
    key: MATERIAL_CHANGES_TYPE_FILTER_KEY,
    type: 'checkbox',
    title: 'Material changes type',
    isAdditional: false,
    isGrouped: false,
    options: entries(labelToMaterialChanges).map(([key, summaries]) => ({
      key,
      value: key,
      title: `${key} (${summaries.length})`,
    })),
  };
}

function CardContent() {
  const { pullRequestScan } = useInject();
  const filtersData = useLocalFilters();

  const {
    pullRequestScan: { key },
  } = usePullRequestScanContext();

  const materialChangesSummaries = useSuspense(pullRequestScan.getPullRequestMaterialChanges, {
    key,
  });

  const { orderedMaterialChangesSummaries, filterOptions } = useMemo(
    () => ({
      orderedMaterialChangesSummaries: _.orderBy(
        materialChangesSummaries,
        [
          summary => riskOrder[summary.materialChange.riskLevel],
          summary => summary.materialChange.orderByValue,
        ],
        ['desc', 'asc']
      ),
      filterOptions: [createLabelsFilterOption(materialChangesSummaries)],
    }),
    [materialChangesSummaries]
  );

  const dataModel = useClientDataTable(
    orderedMaterialChangesSummaries,
    {
      key: 'materialChangesTable',
      columns: tableColumns,
      hasToggleColumns: false,
      searchParams: { filters: filtersData.activeFilters },
    },
    useCallback(
      (item, { filters }) =>
        filters[MATERIAL_CHANGES_TYPE_FILTER_KEY]?.values?.length
          ? filters[MATERIAL_CHANGES_TYPE_FILTER_KEY]?.values.includes(item.label)
          : true,
      []
    )
  );

  return (
    <TableContainer>
      <PlainFiltersControls filters={filterOptions} filtersData={filtersData} />
      <CollapsibleTable tableModel={dataModel} items={orderedMaterialChangesSummaries} />
    </TableContainer>
  );
}

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const MaterialChangeTypeCell = styled(
  ({
    data: { governanceRule, materialChange },
    ...props
  }: { data: PullRequestMaterialChangesSummary } & StyledProps) => {
    const {
      pullRequestScan: { repository },
    } = usePullRequestScanContext();

    return (
      <Table.FlexCell {...props}>
        <MaterialChangeFactory
          repository={repository}
          governanceRule={governanceRule}
          thenSubType={governanceRule.then[materialChange.ruleThenIndexes[0]].subType}
          materialChange={materialChange}
          commitSha={materialChange.sourceCommitSha}
        />
      </Table.FlexCell>
    );
  }
)`
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;

  ${Paragraph},
  ${Heading} {
    margin-bottom: 0 !important;
  }

  ${ExternalLink} {
    font-size: var(--font-size-s);
    font-weight: 400;
  }

  ${MaterialChangesRow} {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
`;

const tableColumns: Column<PullRequestMaterialChangesSummary>[] = [
  {
    key: 'risk-level-column',
    label: 'Risk',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <RiskIcon riskLevel={data.materialChange.riskLevel} />
      </Table.Cell>
    ),
    width: '19rem',
    resizeable: false,
  },
  {
    key: 'material-change-column',
    label: 'Type of change',
    Cell: MaterialChangeTypeCell,
    resizeable: false,
  },
];
