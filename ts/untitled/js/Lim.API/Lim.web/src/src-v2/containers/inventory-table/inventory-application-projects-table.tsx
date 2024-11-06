import { VendorIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { ExternalLink } from '@src-v2/components/typography';
import { PlainInventoryTable } from '@src-v2/containers/inventory-table/plain-inventory-table';
import { useInject } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { Column } from '@src-v2/types/table';
import { ProfileRiskBadge } from '@src/blocks/ConsumableInfiniteScroll/blocks/ProfileRiskBadge';

export function InventoryApplicationProjectTable({ applicationKey }: { applicationKey: string }) {
  const { applicationProfiles } = useInject();

  const dataModel = useDataTable(applicationProfiles.searchApplicationProjects, {
    searchParams: { applicationKey },
    columns: inventoryApplicationProjectColumns,
  });

  return <PlainInventoryTable dataModel={dataModel} />;
}

const inventoryApplicationProjectColumns: Column<ProjectProfile>[] = [
  {
    key: 'name-cell',
    label: 'Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <VendorIcon name={data.provider} /> <ExternalLink href={data.url}>{data.name}</ExternalLink>
      </Table.FlexCell>
    ),
  },
  {
    key: 'open-issue-cell',
    label: 'Open issues',
    width: '40rem',
    resizeable: false,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.openIssuesCount.toLocaleString()}</SimpleTextCell>
    ),
  },
  {
    key: 'risk-badge-cell',
    label: '',
    width: '40rem',
    resizeable: false,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ProfileRiskBadge profile={data} />
      </Table.Cell>
    ),
  },
  /*
Teams cell - to be uncommented once BE supports
{
  key: 'teams',
  label: 'Teams',
  Cell: TeamsCell,
  betaFeature: FeatureFlag.OrgTeams,
},*/
];
