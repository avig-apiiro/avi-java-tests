import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AvatarProfile } from '@src-v2/components/avatar';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { DistanceTime, TimeTooltip } from '@src-v2/components/time';
import { Size } from '@src-v2/components/types/enums/size';
import { LinesEllipsisText, Link } from '@src-v2/components/typography';
import { ContributorBadges } from '@src-v2/containers/contributors/contributor-badges';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableCounter, TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useFilters } from '@src-v2/hooks/use-filters';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { formatNumber } from '@src-v2/utils/number-utils';

const ContributorsTable = observer(({ dataModel, filterOptions }) => (
  <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Contributors' }}>
    <FluidTableControls>
      <TableSearch placeholder="Search contributors" />
      <TableControls.Filters>
        <FiltersControls filterOptions={filterOptions} />
      </TableControls.Filters>
      <TableControls.Counter>
        <TableCounter dataModel={dataModel} itemName="contributors" />
      </TableControls.Counter>
    </FluidTableControls>

    <ContributorsDataTable dataModel={dataModel} expandable>
      {item => (
        // @ts-ignore
        <DataTable.Row key={item.key} data={item} />
      )}
    </ContributorsDataTable>

    {dataModel.searchState.items.length > 0 && (
      <TablePagination searchState={dataModel.searchState} />
    )}
  </AnalyticsLayer>
));

const ContributorNameCell = ({ data, ...props }) => (
  <Table.FlexCell {...props}>
    <AvatarProfile
      size={Size.SMALL}
      active={data.profile.isActive}
      identityKey={data.profile.key}
      username={data.profile.displayName}
      lastActivity={data.profile.lastActivity}
      activeSince={data.profile.activeSince}>
      <Link to={`/users/contributors/${data.profile.representativeIdentityKeySha}`}>
        {data.profile.displayName}
      </Link>
    </AvatarProfile>
  </Table.FlexCell>
);
const ContributorPermissionCell = ({ data, ...props }) => (
  <Table.Cell {...props}>
    <LinesEllipsisText>{data.relatedProfile.accessRole}</LinesEllipsisText>
  </Table.Cell>
);
const ContributorCommitsCell = ({ data, ...props }) => (
  <Table.Cell {...props}>{formatNumber(data.relatedProfile.commitCount)}</Table.Cell>
);
const ContributorStartedCell = ({ data, ...props }) => (
  <Table.Cell {...props}>
    {data.relatedProfile.activeSince && (
      <TimeTooltip date={data.relatedProfile.activeSince}>
        <DistanceTime date={data.relatedProfile.activeSince} addSuffix strict />
      </TimeTooltip>
    )}
  </Table.Cell>
);

const ContributorBadgesCell = ({ data, ...props }) => (
  <Table.Cell {...props}>
    {data.relatedProfile.badges?.some(Boolean) && (
      <ContributorBadges badges={data.relatedProfile.badges} />
    )}
  </Table.Cell>
);

export const ContributorsTableContainer = observer(
  ({
    profileKey,
    profileType,
    shouldShowPermissionColumn,
  }: {
    profileKey: string;
    profileType: ProfileType;
    shouldShowPermissionColumn: boolean;
  }) => {
    const { contributors, application } = useInject();

    const { activeFilters } = useFilters();
    const { searchTerm, ...filters } = activeFilters;

    const dataModel = useDataTable(contributors.searchContributors, {
      key: `contributors`,
      columns: [
        {
          key: 'name-column',
          label: 'Name',
          resizeable: false,
          Cell: ContributorNameCell,
        },
        ...(application.isFeatureEnabled(FeatureFlag.BranchProtection) && shouldShowPermissionColumn
          ? [
              {
                key: 'permission-column',
                label: 'Permission',
                resizeable: false,
                Cell: ContributorPermissionCell,
              },
            ]
          : []),
        {
          key: 'commits-column',
          label: 'Commits',
          resizeable: false,
          Cell: ContributorCommitsCell,
        },
        {
          key: 'started-column',
          label: 'Started',
          resizeable: false,
          Cell: ContributorStartedCell,
        },
        {
          key: 'badges-column',
          label: '',
          resizeable: false,
          Cell: ContributorBadgesCell,
        },
      ],
      searchParams: { filters, profileKey, profileType },
    });

    const filterOptions = useSuspense(contributors.getFilterOptions, { profileType });

    return <ContributorsTable dataModel={dataModel} filterOptions={filterOptions} />;
  }
);

const ContributorsDataTable = styled(DataTable)`
  ${Table.Body} ${Table.Row} {
    height: 14rem;
  }

  ${Table.Cell}:last-child {
    padding-right: 2rem;
  }
`;
