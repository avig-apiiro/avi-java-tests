import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { DateTime } from '@src-v2/components/time';
import { ExternalLink } from '@src-v2/components/typography';
import { Column } from '@src-v2/types/table';

export type EventType = any; // TODO: will be updated once have BE data to match

const DateCell = ({ data, ...props }) => (
  <Table.Cell {...props}>
    <DateTime date={data.lastSeen} format="PP" />
  </Table.Cell>
);

const LastExecutionCell = ({ data, ...props }) => (
  <DoubleLinedCell {...props}>
    <DateTime date={data.lastSeen} format="p" />
    <DateTime date={data.lastSeen} format="PP" />
  </DoubleLinedCell>
);

const StatusCell = ({ data, ...props }) => (
  <Table.FlexCell {...props}>
    <StatusIndicator data-status={data.status} />
    {data.status}
  </Table.FlexCell>
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

export const eventsTableColumns: Column<EventType>[] = [
  {
    key: 'date',
    label: 'Date',
    width: '10rem',
    Cell: DateCell,
  },
  {
    key: 'url',
    label: 'URL',
    minWidth: '55rem',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <ExternalLink href={data.serverUrl} style={{ width: '100%' }}>
          <ClampText lines={5}>{data.serverUrl}</ClampText>
        </ExternalLink>
      </Table.FlexCell>
    ),
  },
  {
    key: 'event-message',
    label: 'Event message',
    minWidth: '55rem',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <ClampText lines={5}>{data.event}</ClampText>
      </Table.FlexCell>
    ),
  },
  {
    key: 'details',
    label: 'Details',
    minWidth: '55rem',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <ClampText lines={5}>{data.details}</ClampText>
      </Table.FlexCell>
    ),
  },
  {
    key: 'event-status',
    label: 'Event status',
    width: '40rem',
    Cell: StatusCell,
  },
  {
    key: 'count',
    label: 'Count',
    width: '30rem',
    resizeable: false,
    Cell: ({ data, ...props }) => <Table.Cell {...props}>{data.count}</Table.Cell>,
  },
  {
    key: 'last-execution',
    label: 'Last execution',
    width: '10rem',
    Cell: LastExecutionCell,
  },
];
