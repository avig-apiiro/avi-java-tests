import { observer } from 'mobx-react';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { SvgIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { EllipsisText } from '@src-v2/components/typography';
import { ConnectionsTable } from '@src-v2/containers/connectors/connections-table';
import { MonitorToggle } from '@src-v2/containers/connectors/management/monitor-toggle';
import { DataTable, useDataTableContext } from '@src-v2/containers/data-table/data-table';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { ArtifactType } from '@src-v2/services';
import { modify } from '@src-v2/utils/mobx-utils';

export const ConnectionArtifactsTable = observer((props: any) => {
  const { connectors, asyncCache } = useInject();
  const { connectionUrl } = useParams<{ connectionUrl: string }>();

  const filterGroups = useSuspense(connectors.getArtifactsFilterOptions);
  const dataModel = useDataTable(connectors.searchConnectionArtifacts, {
    columns: tableColumns,
    searchParams: { connectionUrl },
  });

  useEffect(() => {
    return () => asyncCache.invalidateAll(connectors.searchConnectionArtifacts);
  }, []);

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Connection Artifacts table' }}>
      <ConnectionsTable
        {...props}
        dataModel={dataModel}
        filterGroups={filterGroups}
        searchItem={{ singular: 'artifact', plural: 'artifacts' }}>
        {(row: ArtifactType) => <DataTable.Row key={row.key} data={row} />}
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
      .toggleMonitoredArtifactRepository({ key, shouldMonitor })
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

const tableColumns = [
  { label: 'Monitoring', width: '30rem', resizeable: false, Cell: MonitoringCell },
  {
    label: 'Artifact repository name',
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
];

export const ConnectionIcon = styled(SvgIcon)`
  color: var(--color-white);

  &[data-connected] {
    color: var(--color-green-50);
  }

  &[data-broker-error] {
    color: var(--color-orange-50);
  }
`;
