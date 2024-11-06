import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Table } from '@src-v2/components/table/table';
import { EllipsisText } from '@src-v2/components/typography';
import { ConnectionsTable } from '@src-v2/containers/connectors/connections-table';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';

export const ConnectionClustersTable = observer(props => {
  const { connectors } = useInject();
  const { connectionUrl } = useParams<{ connectionUrl: string }>();

  const filterGroups = useSuspense(connectors.getClustersFilterOptions);
  const dataModel = useDataTable(connectors.searchConnectionClusters, {
    columns: tableColumns,
    searchParams: { connectionUrl },
  });

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Connection Clusters table' }}>
      <ConnectionsTable
        {...props}
        dataModel={dataModel}
        filterGroups={filterGroups}
        searchItem={{ singular: 'cluster', plural: 'clusters' }}>
        {row => <DataTable.Row key={row.key} data={row} />}
      </ConnectionsTable>
    </AnalyticsLayer>
  );
});

const tableColumns = [
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
