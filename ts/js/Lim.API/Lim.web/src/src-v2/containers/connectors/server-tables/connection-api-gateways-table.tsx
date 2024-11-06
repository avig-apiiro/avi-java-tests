import { observer } from 'mobx-react';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Table } from '@src-v2/components/table/table';
import { EllipsisText } from '@src-v2/components/typography';
import { ConnectionsTable } from '@src-v2/containers/connectors/connections-table';
import { MonitorToggle } from '@src-v2/containers/connectors/management/monitor-toggle';
import { DataTable, useDataTableContext } from '@src-v2/containers/data-table/data-table';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { modify } from '@src-v2/utils/mobx-utils';

export const ConnectionApiGatewaysTable = observer((props: any) => {
  const { connectors, asyncCache } = useInject();
  const { connectionUrl } = useParams<{ connectionUrl: string }>();

  const filterGroups = useSuspense(connectors.getApiGatewayFilterOptions);
  const dataModel = useDataTable(connectors.searchConnectionApiGateways, {
    columns: tableColumns,
    searchParams: { connectionUrl },
  });

  useEffect(() => {
    return () => asyncCache.invalidateAll(connectors.searchConnectionApiGateways);
  }, []);

  return (
    <AnalyticsLayer
      analyticsData={{ [AnalyticsDataField.Context]: 'Connection Api-Gateways table' }}>
      <ConnectionsTable
        {...props}
        dataModel={dataModel}
        filterGroups={filterGroups}
        searchItem={{ singular: 'API gateway', plural: 'API gateways' }}>
        {row => <DataTable.Row key={row.key} data={row} />}
      </ConnectionsTable>
    </AnalyticsLayer>
  );
});

const MonitoringCell = observer(({ data, ...props }) => {
  const { connectors, rbac } = useInject();
  const { dataModel } = useDataTableContext();

  const handleMonitorChange = useCallback(({ key, shouldMonitor }) => {
    const item = dataModel.searchState.items.find(project => project.key === key);
    modify(item, { isMonitored: shouldMonitor });

    connectors
      .toggleMonitoredApiGateway({ key, shouldMonitor })
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
});

const tableColumns = [
  { label: 'Monitoring', width: '30rem', resizeable: false, Cell: MonitoringCell },
  {
    label: 'Name',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <EllipsisText>{data.name}</EllipsisText>
      </Table.Cell>
    ),
  },
  {
    label: 'Description',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <EllipsisText>{data.description}</EllipsisText>
      </Table.Cell>
    ),
  },
  {
    label: 'Account/Tenant id',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <EllipsisText>{data.accountId}</EllipsisText>
      </Table.Cell>
    ),
  },
];
