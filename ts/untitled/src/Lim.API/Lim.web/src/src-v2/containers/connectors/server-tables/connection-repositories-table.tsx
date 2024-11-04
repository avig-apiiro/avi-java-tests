import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Table } from '@src-v2/components/table/table';
import { EllipsisText } from '@src-v2/components/typography';
import {
  ConnectionsTable,
  bulkMonitorToggle,
} from '@src-v2/containers/connectors/connections-table';
import { BulkIgnoreButton } from '@src-v2/containers/connectors/management/bulk-ignore-button';
import { BulkMonitorButton } from '@src-v2/containers/connectors/management/bulk-monitor-button';
import {
  LanguagesCell,
  MonitorBranchCell,
  MonitoringCell,
  RepositoryCell,
  SuggestedCell,
} from '@src-v2/containers/connectors/management/repositories-management';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { SelectedCount } from '@src-v2/containers/data-table/table-controls';
import { TagCell } from '@src-v2/containers/risks/risks-common-cells';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { modify } from '@src-v2/utils/mobx-utils';
import { formatNumber } from '@src-v2/utils/number-utils';

export const ConnectionRepositoriesTable = observer(props => {
  const { connectors, toaster, asyncCache } = useInject();
  const { connectionUrl } = useParams<{ connectionUrl: string }>();

  const [connection, filterGroups] = useSuspense([
    [connectors.getConnection, { key: connectionUrl }] as const,
    [
      connectors.getRepositoriesFilterOptions,
      { isSingleConnection: true, serverUrl: connectionUrl },
    ] as const,
  ]);

  const columns = useMemo<any>(
    () => (connection.provider === 'Perforce' ? perforceTableColumns : tableColumns),
    [connection]
  );
  const dataModel = useDataTable(connectors.searchConnectionRepositories, {
    columns,
    selectable: true,
    searchParams: { connectionUrl },
  });

  useEffect(() => {
    return () => asyncCache.invalidateAll(connectors.searchConnectionRepositories);
  }, []);

  const handleBulkMonitorToggle = useCallback(() => {
    bulkMonitorToggle({
      asyncHandler: connectors.bulkToggleMonitoredProviderRepositories,
      dataModel,
      toaster,
    });
  }, [dataModel.selection, dataModel.searchState]);

  const handleBulkIgnoreToggle = useCallback(
    async ({ ignoreReason, isAllIgnored }) => {
      modify(dataModel.searchState, { loading: true });
      try {
        await connectors.bulkToggleIgnoredProviderRepositories({
          shouldIgnore: !isAllIgnored,
          ignoreReason,
          data: dataModel.selection,
        });
        toaster.success('Changes saved successfully!');
      } catch (error) {
        toaster.error('Failed to change monitor status, please try again');
      } finally {
        modify(dataModel.searchState, { loading: false });
      }
    },
    [dataModel.selection, dataModel.searchState]
  );

  return (
    <AnalyticsLayer
      analyticsData={{ [AnalyticsDataField.Context]: 'Connection Repositories table' }}>
      <ConnectionsTable
        {...props}
        dataModel={dataModel}
        filterGroups={filterGroups}
        searchItem={{ singular: 'repository', plural: 'repositories' }}
        conditionalActions={
          <>
            <SelectedCount>{formatNumber(dataModel.selection.length)} Selected</SelectedCount>
            <BulkMonitorButton
              searchState={dataModel.searchState}
              data={dataModel.selection}
              onClick={handleBulkMonitorToggle}
            />
            <BulkIgnoreButton
              searchState={dataModel.searchState}
              data={dataModel.selection}
              onSubmit={handleBulkIgnoreToggle}
            />
          </>
        }>
        {row => <DataTable.Row key={row.key} data={row} />}
      </ConnectionsTable>
    </AnalyticsLayer>
  );
});

const tableColumns = [
  {
    label: 'Monitoring',
    width: '30rem',
    resizeable: false,
    Cell: MonitoringCell,
  },
  { label: 'Suggested', width: '26rem', resizeable: false, Cell: SuggestedCell },
  { label: 'Name', Cell: RepositoryCell },
  { label: 'Monitored branches', width: '40rem', Cell: MonitorBranchCell },
  {
    label: 'Repository group',
    width: '50rem',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <EllipsisText>{data.projectId}</EllipsisText>
      </Table.Cell>
    ),
  },
  {
    label: 'Privacy',
    width: '20rem',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>{data.isPublicPrivacy ? 'Public' : 'Private'}</Table.Cell>
    ),
  },
  {
    label: 'Languages',
    width: '35rem',
    Cell: LanguagesCell,
  },
  {
    label: 'Repository Tag',
    width: '35rem',
    Cell: ({ data }) => <TagCell tags={data.tags} />,
    isAdditional: true,
    betaFeature: FeatureFlag.ProviderRepositoryTagFilter,
  },
];

const perforceTableColumns = [
  tableColumns.find(column => column.label === 'Monitoring'),
  tableColumns.find(column => column.label === 'Suggested'),
  { label: 'Name', Cell: RepositoryCell },
  { label: 'Stream ID', Cell: ({ data }) => <Table.FlexCell>{data.url}</Table.FlexCell> },
  { label: 'Parent stream', Cell: ({ data }) => <Table.FlexCell>{data.projectId}</Table.FlexCell> },
];
