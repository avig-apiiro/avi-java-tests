import { ClampText } from '@src-v2/components/clamp-text';
import { useProfilesContext } from '@src-v2/components/profiles-inject-context';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { Size } from '@src-v2/components/types/enums/size';
import { Link } from '@src-v2/components/typography';
import { ContributorAvatar } from '@src-v2/containers/contributors/contributor-avatar';
import { PlainInventoryTable } from '@src-v2/containers/inventory-table/plain-inventory-table';
import { dateFormats } from '@src-v2/data/datetime';
import { useFormatDate } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { DeployKey } from '@src-v2/types/profiles/deploy-key';
import { Column } from '@src-v2/types/table';
import { Table } from '@src/src-v2/components/table/table';

export function DeployKeysTable({ profile }: { profile: any }) {
  const { profiles } = useProfilesContext();
  const dataModel = useDataTable(profiles.getDeployKeys, {
    searchParams: { key: profile.key },
    columns,
    ignorePagination: true,
  });

  return <PlainInventoryTable dataModel={dataModel} />;
}

const columns: Column<DeployKey>[] = [
  {
    key: 'title-column',
    label: 'Title',
    resizeable: true,
    Cell: ({ data, ...props }) => <SimpleTextCell {...props}>{data.title}</SimpleTextCell>,
  },
  {
    key: 'created-on-column',
    label: 'Created on',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>
        {useFormatDate(data.createdAt, dateFormats.longDate)}
      </SimpleTextCell>
    ),
  },
  {
    key: 'created-by-column',
    label: 'Type',
    resizeable: true,
    Cell: ({ data: { createdBy }, ...props }) => (
      <Table.Cell {...props}>
        <Link to={`/users/contributors/${createdBy.identityKey}`}>
          <ContributorAvatar
            size={Size.SMALL}
            name={createdBy.username}
            avatarUrl={createdBy.avatarUrl}
          />
          <ClampText>{createdBy.username}</ClampText>
        </Link>
      </Table.Cell>
    ),
  },
  {
    key: 'access-type-column',
    label: 'Access type',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.readOnly ? 'Read' : 'Read & Write'}</SimpleTextCell>
    ),
  },
  {
    key: 'last-used-on-column',
    label: 'Last used on',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>
        {useFormatDate(data.lastUsed, dateFormats.longDate)}
      </SimpleTextCell>
    ),
  },
];
