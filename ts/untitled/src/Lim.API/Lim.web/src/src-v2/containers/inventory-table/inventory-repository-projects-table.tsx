import { VendorIcon } from '@src-v2/components/icons';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { ExternalLink } from '@src-v2/components/typography';
import { PlainInventoryTable } from '@src-v2/containers/inventory-table/plain-inventory-table';
import { useInject } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { RelatedProjectProfileResponse } from '@src-v2/types/profiles/project-profile';
import { Column } from '@src-v2/types/table';
import { Table } from '@src/src-v2/components/table/table';

export function InventoryRepositoryProjectTable({ repositoryKey }: { repositoryKey: string }) {
  const { profiles } = useInject();

  const dataModel = useDataTable(profiles.searchRepositoryProjectProfiles, {
    searchParams: { repositoryKey },
    columns: inventoryRepositoryProjectColumns,
  });

  return <PlainInventoryTable dataModel={dataModel} />;
}

const inventoryRepositoryProjectColumns: Column<RelatedProjectProfileResponse>[] = [
  {
    key: 'name-cell',
    label: 'Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <VendorIcon name={data.profile.provider} />{' '}
        <ExternalLink href={data.profile.url}>{data.profile.name}</ExternalLink>
      </Table.FlexCell>
    ),
  },
  {
    key: 'issue-count-cell',
    label: 'Issues',
    width: '40rem',
    resizeable: false,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.relatedProfile.issueCount.toLocaleString()}</SimpleTextCell>
    ),
  },
  {
    key: 'pull-requests-cell',
    label: 'Pull requests',
    width: '40rem',
    resizeable: false,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>
        {data.relatedProfile.pullRequestCount.toLocaleString()}
      </SimpleTextCell>
    ),
  },
];
