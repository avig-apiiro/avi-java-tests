import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { IconButton } from '@src-v2/components/buttons';
import { ClampText } from '@src-v2/components/clamp-text';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { BaseIcon } from '@src-v2/components/icons';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import {
  DoubleLinedCell,
  SimpleTextCell,
} from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { DateTime } from '@src-v2/components/time';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink } from '@src-v2/components/typography';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableCounter, TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useLoading, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useFilters } from '@src-v2/hooks/use-filters';
import { SearchLogType } from '@src-v2/services';
import { StubAny } from '@src-v2/types/stub-any';
import { Cell, Column } from '@src-v2/types/table';

export default observer(() => {
  const { session, auditLogs, rbac } = useInject();
  const {
    activeFilters: { searchTerm, ...filters },
  } = useFilters();

  useEffect(() => {
    return () => auditLogs.invalidateLogs();
  }, []);

  const [handleExport, exportLoading] = useLoading(
    async () => await auditLogs.exportLogs({ searchTerm, ...filters }),
    [searchTerm, filters]
  );

  const dataModel = useDataTable(auditLogs.searchLogs, {
    key: `${session?.data?.environmentId}-audit-log`,
    columns: tableColumns,
    hasToggleColumns: false,
    isPinFeatureEnabled: false,
    searchParams: { filters },
  });

  const filterOptions = useSuspense(auditLogs.getFilterOptions);

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <Page title="Audit Log">
      <StickyHeader />
      <Gutters>
        <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Audit Log' }}>
          <FluidTableControls>
            <TableSearch placeholder="Search..." />
            <TableControls.Actions>
              <Button
                startIcon="Export"
                variant={Variant.PRIMARY}
                loading={exportLoading}
                disabled={dataModel.selection.length > 0}
                onClick={handleExport}>
                Export
              </Button>
            </TableControls.Actions>

            <TableControls.Filters>
              <FiltersControls filterOptions={filterOptions} />
            </TableControls.Filters>
            <TableControls.Counter>
              <TableCounter dataModel={dataModel} itemName="events" />
            </TableControls.Counter>
          </FluidTableControls>
          <DataTable dataModel={dataModel}>
            {item => <DataTable.Row key={item.key} data={item} />}
          </DataTable>

          {dataModel.searchState.items.length > 0 && (
            <TablePagination searchState={dataModel.searchState} />
          )}
        </AnalyticsLayer>
      </Gutters>
    </Page>
  );
});

const DateCell: Cell<StubAny> = ({ data, ...props }) => (
  <DoubleLinedCell {...props}>
    <DateTime date={data.timestamp} format="p" />
    <DateTime date={data.timestamp} format="PP" />
  </DoubleLinedCell>
);

const StatusIndicator = styled.span`
  display: flex;
  width: 2rem;
  height: 2rem;
  border-radius: 100vmax;

  &[data-status='Failure'] {
    background-color: var(--color-red-50);
  }

  &[data-status='Success'] {
    background-color: var(--color-green-50);
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const StatusCell: Cell<StubAny> = ({ data, ...props }) => (
  <Table.FlexCell {...props}>
    <Tooltip content={data.errorDescription} disabled={data.status === 'Success'}>
      <StatusContainer>
        <StatusIndicator data-status={data.status} />
        {data.status}
      </StatusContainer>
    </Tooltip>
  </Table.FlexCell>
);

const EventCell = styled(({ data, ...props }: { data: SearchLogType }) => (
  <Table.FlexCell {...props}>
    <ClampText lines={2}>{data.eventDescription}</ClampText>
    {data.impactedEntityUrl && (
      <Tooltip content="View event">
        <ExternalLink href={data.impactedEntityUrl}>
          <IconButton name="External" />
        </ExternalLink>
      </Tooltip>
    )}
  </Table.FlexCell>
))`
  ${BaseIcon} {
    width: 5rem;
    height: 5rem;
  }
`;

export const tableColumns: Column<SearchLogType>[] = [
  {
    key: 'date',
    label: 'Date',
    width: '10rem',
    Cell: DateCell,
  },
  {
    key: 'user',
    label: 'User',
    width: '40rem',
    Cell: ({ data, ...props }) => <SimpleTextCell {...props}>{data?.user}</SimpleTextCell>,
  },
  {
    key: 'event-type',
    label: 'Event Type',
    width: '40rem',
    Cell: ({ data, ...props }) => <SimpleTextCell {...props}>{data?.eventType}</SimpleTextCell>,
  },
  {
    key: 'event',
    label: 'Event',
    width: '130rem',
    Cell: EventCell,
  },
  {
    key: 'status',
    label: 'Status',
    width: '40rem',
    Cell: StatusCell,
  },
];
