import { observer } from 'mobx-react';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Table } from '@src-v2/components/table/table';
import { IconTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { EllipsisText, Paragraph } from '@src-v2/components/typography';
import {
  ConnectionsTable,
  SuggestionsCell,
  bulkMonitorToggle,
} from '@src-v2/containers/connectors/connections-table';
import { BulkMonitorButton } from '@src-v2/containers/connectors/management/bulk-monitor-button';
import { MonitorToggle } from '@src-v2/containers/connectors/management/monitor-toggle';
import { DataTable, useDataTableContext } from '@src-v2/containers/data-table/data-table';
import { SelectedCount } from '@src-v2/containers/data-table/table-controls';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useLoading, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { modify } from '@src-v2/utils/mobx-utils';
import { formatNumber } from '@src-v2/utils/number-utils';

export const ConnectionProjectsTable = observer(props => {
  const { connectors, toaster, asyncCache } = useInject();
  const { connectionUrl } = useParams<{ connectionUrl: string }>();

  const filterGroups = useSuspense(connectors.getProjectsFilterOptions);
  const dataModel = useDataTable(connectors.searchConnectionProjects, {
    columns: tableColumns,
    selectable: true,
    searchParams: { connectionUrl },
  });

  useEffect(() => {
    return () => asyncCache.invalidateAll(connectors.searchConnectionProjects);
  }, []);

  const handleBulkMonitorToggle = useCallback(() => {
    bulkMonitorToggle({
      asyncHandler: connectors.bulkToggleMonitoredProjects,
      dataModel,
      toaster,
    });
  }, [dataModel.selection, dataModel.searchState]);

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Connection Projects table' }}>
      <ConnectionsTable
        {...props}
        conditionalActions={
          <>
            <SelectedCount>{formatNumber(dataModel.selection.length)} Selected </SelectedCount>
            <BulkMonitorButton
              data={dataModel.selection}
              searchState={dataModel.searchState}
              onClick={handleBulkMonitorToggle}
            />
          </>
        }
        dataModel={dataModel}
        filterGroups={filterGroups}
        searchItem={{ singular: 'issue project', plural: 'issue projects' }}>
        {row => <DataTable.Row key={row.key} data={row} />}
      </ConnectionsTable>
    </AnalyticsLayer>
  );
});

const MonitoringCell = ({ data, ...props }) => {
  const { connectors, toaster, rbac } = useInject();
  const { dataModel } = useDataTableContext();

  const [handleMonitorChange, loading] = useLoading(async ({ key, shouldMonitor }) => {
    const item = dataModel.searchState.items.find(project => project.key === key);
    try {
      // @ts-expect-error
      await connectors.toggleMonitoredProject({ key, shouldMonitor, serverUrl: item.serverUrl });
      modify(item, { isMonitored: shouldMonitor });
    } catch (error) {
      toaster.error('Failed to change monitor status, please try again');
    }
  }, []);

  return (
    <Table.Cell {...props}>
      <MonitorToggle
        data={data}
        loading={loading}
        onChange={handleMonitorChange}
        disabled={!rbac.canEdit(resourceTypes.Connectors)}
      />
    </Table.Cell>
  );
};

const tableColumns = [
  { label: 'Monitoring', width: '30rem', resizeable: false, Cell: MonitoringCell },
  {
    label: 'Suggested',
    width: '26rem',
    resizeable: false,
    Cell: ({ data, ...props }) => (
      <SuggestionsCell {...props}>
        {data.isRecommended && (
          <IconTooltip
            name="Star"
            content={
              <>
                <Paragraph>Recommended for being learned</Paragraph>
                <Paragraph>This project is more active than others</Paragraph>
              </>
            }
          />
        )}
      </SuggestionsCell>
    ),
  },
  {
    label: 'Name',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <EllipsisText>{data?.name}</EllipsisText>
        {data.isActive && (
          <ActivityIndicator active={data.isActive} content="This project is active" />
        )}
        {data.isArchived && <IconTooltip name="Archive" content="Project archived" />}
      </Table.FlexCell>
    ),
  },
];
