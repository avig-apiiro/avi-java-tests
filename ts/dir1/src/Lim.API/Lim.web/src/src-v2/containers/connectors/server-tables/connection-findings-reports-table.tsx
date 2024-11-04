import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { EllipsisText, ExternalLink } from '@src-v2/components/typography';
import {
  ConnectionsTable,
  bulkMonitorToggle,
} from '@src-v2/containers/connectors/connections-table';
import { BulkMonitorButton } from '@src-v2/containers/connectors/management/bulk-monitor-button';
import { MonitorToggle } from '@src-v2/containers/connectors/management/monitor-toggle';
import { DataTable, useDataTableContext } from '@src-v2/containers/data-table/data-table';
import { SelectedCount } from '@src-v2/containers/data-table/table-controls';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { Provider } from '@src-v2/types/enums/provider';
import { modify } from '@src-v2/utils/mobx-utils';
import { formatNumber } from '@src-v2/utils/number-utils';

export const FindingsReportsTable = observer((props: any) => {
  const { connectors, toaster, asyncCache } = useInject();
  const { connectionUrl } = useParams<{ connectionUrl: string }>();
  const history = useHistory();

  const [filterGroups, { provider }] = useSuspense([
    [connectors.getFindingsReportsFilterOptions, { serverUrl: connectionUrl }] as const,
    [connectors.getConnection, { key: connectionUrl }] as const,
  ]);

  const tableColumns = useMemo(() => getTableColumns(provider), [provider]);

  const dataModel = useDataTable(connectors.searchConnectionFindingsReports, {
    columns: tableColumns,
    selectable: true,
    searchParams: { connectionUrl },
  });

  useEffect(() => {
    if (provider === Provider.JFrog) {
      history.push(`/connectors/manage/server/${connectionUrl}/artifact-repositories`);
    }

    return () => asyncCache.invalidateAll(connectors.searchConnectionFindingsReports);
  }, []);

  const handleBulkMonitorToggle = useCallback(() => {
    bulkMonitorToggle({
      asyncHandler: connectors.bulkToggleMonitoredFindingReports,
      dataModel,
      toaster,
    });
  }, [dataModel.selection, dataModel.searchState]);

  return (
    <AnalyticsLayer
      analyticsData={{ [AnalyticsDataField.Context]: 'Connection Finding Reports table' }}>
      <ConnectionsTable
        {...props}
        dataModel={dataModel}
        filterGroups={filterGroups}
        searchItem={{
          singular: provider === 'Wiz' ? 'container image' : 'project',
          plural: provider === 'Wiz' ? 'container images' : 'projects',
        }}
        conditionalActions={
          <>
            <SelectedCount>{formatNumber(dataModel.selection.length)} Selected</SelectedCount>
            <BulkMonitorButton
              searchState={dataModel.searchState}
              data={dataModel.selection}
              onClick={handleBulkMonitorToggle}
            />
          </>
        }>
        {row => <DataTable.Row key={row.key} data={row} />}
      </ConnectionsTable>
    </AnalyticsLayer>
  );
});

const MonitoringCell = ({ data, ...props }) => {
  const { connectors, rbac } = useInject();
  const { dataModel } = useDataTableContext();

  const handleMonitorChange = useCallback(({ key, shouldMonitor }) => {
    const item = dataModel.searchState.items.find(project => project.key === key);
    modify(item, { isMonitored: shouldMonitor });

    connectors
      .toggleMonitoredFindingsReport({ key, shouldMonitor })
      .catch(() => modify(item, { isMonitored: !shouldMonitor }));
  }, []);

  return (
    <Table.Cell {...props}>
      <MonitorToggle
        data={data}
        onChange={handleMonitorChange}
        disabled={!rbac.canEdit(resourceTypes.Connectors)}
      />
    </Table.Cell>
  );
};

export const NameCell = ({ data, ...props }) => (
  <Table.Cell {...props}>
    {data?.url ? (
      <Tooltip content="Go to project">
        <ExternalLink href={data.url}>
          <ClampText lines={2} withTooltip={false}>
            {data.name}
          </ClampText>
        </ExternalLink>
      </Tooltip>
    ) : (
      <ClampText lines={2}>{data.name}</ClampText>
    )}
  </Table.Cell>
);

const getTableColumns = provider =>
  [
    { label: 'Monitoring', width: '30rem', resizeable: false, Cell: MonitoringCell },
    {
      label: 'Name',
      Cell: NameCell,
    },
    provider !== 'Wiz' &&
      provider !== 'Orca' &&
      provider !== 'PrismaCloud' && {
        key: 'branch-name',
        label: 'Branch name',
        Cell: ({ data, ...props }) => <Table.Cell {...props}>{data.branchName}</Table.Cell>,
      },
    provider === 'Snyk' && {
      label: 'Organization',
      Cell: ({ data, ...props }) => (
        <Table.Cell {...props}>
          <EllipsisText>
            {data.providerExtensionData && data.providerExtensionData.organizationName}
          </EllipsisText>
        </Table.Cell>
      ),
    },
  ].filter(Boolean);
