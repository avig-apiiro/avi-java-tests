import { useCallback } from 'react';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { RepositoryPopover } from '@src-v2/components/repositories/repository-popover';
import { RiskDetails } from '@src-v2/components/risk/risk-details';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { useOpenDataModelReferencePane } from '@src-v2/containers/entity-pane/use-open-data-model-reference-pane';
import { PlainInventoryTable } from '@src-v2/containers/inventory-table/plain-inventory-table';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useFilters } from '@src-v2/hooks/use-filters';
import { RepositoryDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { RepositoryProfileResponse } from '@src-v2/types/profiles/repository-profile-response';
import { Column } from '@src-v2/types/table';
import { Table } from '@src/src-v2/components/table/table';

export function InventoryRepositoriesTable({ applicationKey }: { applicationKey: string }) {
  return (
    <AsyncBoundary>
      <InnerRepositoriesTable applicationKey={applicationKey} />
    </AsyncBoundary>
  );
}

function InnerRepositoriesTable({ applicationKey }: { applicationKey: string }) {
  const { applicationProfiles } = useInject();
  const openPane = useOpenDataModelReferencePane();
  const filterOptions = useSuspense(applicationProfiles.getFilterOptions);

  const {
    activeFilters: { searchTerm, ...filters },
  } = useFilters();

  const handleOpenPane = useCallback(
    (item: RepositoryProfileResponse) => {
      const dataReference: RepositoryDataModelReference = {
        repositoryKey: item.key,
      };

      openPane(dataReference);
    },
    [openPane]
  );

  const dataModel = useDataTable(applicationProfiles.searchRepositories, {
    searchParams: { filters, applicationKey },
    columns: repositoriesTableColumns,
  });

  return (
    <AnalyticsLayer
      analyticsData={{ [AnalyticsDataField.Context]: 'Inventory Repositories Table' }}>
      <PlainInventoryTable
        dataModel={dataModel}
        filterOptions={filterOptions}
        row={({ data, ...rowProps }) => (
          <DataTable.Row {...rowProps} data={data} onClick={() => handleOpenPane(data)} />
        )}
      />
    </AnalyticsLayer>
  );
}

const RiskDetailsCellContent = styled(RiskDetails)`
  justify-content: flex-end;
  align-items: center;
  gap: 2rem;
`;

const repositoriesTableColumns: Column<RepositoryProfileResponse>[] = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: false,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <RepositoryPopover repositoryProfile={data} />
      </Table.Cell>
    ),
  },
  {
    key: 'repository-group-column',
    label: 'Repository Group',
    resizeable: false,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.repositoryGroupId}</SimpleTextCell>
    ),
  },
  {
    key: 'number-of-commits-column',
    label: '# Commits',
    resizeable: false,
    width: '30rem',
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.commitCount?.toLocaleString()}</SimpleTextCell>
    ),
  },
  {
    key: 'risk-details-column',
    label: '',
    resizeable: false,
    width: '25rem',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        {/*@ts-expect-error*/}
        <RiskDetailsCellContent profile={data} showLabel={false} small />
      </Table.Cell>
    ),
  },
  /*
  Teams cell - to be uncommented once BE supports
  {
    key: 'teams',
    label: 'Teams',
    Cell: TeamsCell,
    betaFeature: FeatureFlag.OrgTeams,
  },*/
];
