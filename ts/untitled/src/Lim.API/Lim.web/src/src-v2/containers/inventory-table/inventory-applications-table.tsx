import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { ClampText } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { Size } from '@src-v2/components/types/enums/size';
import { Link } from '@src-v2/components/typography';
import { PlainInventoryTable } from '@src-v2/containers/inventory-table/plain-inventory-table';
import { useInject } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumable } from '@src-v2/types/profiles/lean-consumable';
import { Column } from '@src-v2/types/table';

export function InventoryApplicationsTable(props: { repositoryKey: string }) {
  return (
    <AsyncBoundary>
      <InnerApplicationsTable {...props} />
    </AsyncBoundary>
  );
}

function InnerApplicationsTable({ repositoryKey }: { repositoryKey: string }) {
  const { profiles } = useInject();

  const dataModel = useDataTable(profiles.getRepositoryApplications, {
    searchParams: { key: repositoryKey },
    columns: applicationsTableColumns,
  });

  return (
    <AnalyticsLayer
      analyticsData={{ [AnalyticsDataField.Context]: 'Inventory Applications Table' }}>
      <PlainInventoryTable dataModel={dataModel} />
    </AnalyticsLayer>
  );
}

const LeanConsumableDisplay = styled(({ value, ...props }: { value: LeanConsumable }) => (
  <div {...props}>
    <VendorIcon name={value.provider} size={Size.XSMALL} />
    {value.monitoredProfileKey ? (
      <Link to={`/profiles/repositories/${value.monitoredProfileKey}`}>
        <ClampText>{value.name}</ClampText>
      </Link>
    ) : (
      <ClampText>{value.name}</ClampText>
    )}
  </div>
))`
  display: flex;
  gap: 1rem;
`;

const applicationsTableColumns: Column<LeanApplication>[] = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: false,
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <BusinessImpactIndicator businessImpact={data.businessImpact} />
        <CustomLink to={`/profiles/applications/${data.key}`}>
          <ClampText>{data.name}</ClampText>
        </CustomLink>
      </Table.FlexCell>
    ),
  },
  {
    key: 'repositories-column',
    label: 'Repositories',
    resizeable: false,
    Cell: ({ data, ...props }) => {
      return (
        <TrimmedCollectionCell {...props} item={LeanConsumableDisplay}>
          {data.repositories}
        </TrimmedCollectionCell>
      );
    },
  },
  {
    key: 'projects-column',
    label: 'Projects',
    resizeable: false,
    Cell: ({ data, ...props }) => {
      return (
        <TrimmedCollectionCell {...props} item={LeanConsumableDisplay}>
          {data.projects}
        </TrimmedCollectionCell>
      );
    },
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

const CustomLink = styled(Link)`
  max-width: 95rem;
`;
