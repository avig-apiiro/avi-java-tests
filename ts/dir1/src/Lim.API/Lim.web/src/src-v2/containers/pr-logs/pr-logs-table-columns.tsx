import styled from 'styled-components';
import { AvatarProfile } from '@src-v2/components/avatar';
import { ClampText } from '@src-v2/components/clamp-text';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Table } from '@src-v2/components/table/table';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { DateTime } from '@src-v2/components/time';
import { ExternalLink } from '@src-v2/components/typography';
import { LearningButton } from '@src-v2/containers/learning-stats';
import { ApplicationGroupProfileLink } from '@src-v2/containers/profiles/application-group-profile/application-group-profile-link';
import {
  ApplicationsView,
  ConsumableProfileView,
  TeamsView,
} from '@src-v2/containers/profiles/consumable-profiles-view';
import { ReleaseSideView } from '@src-v2/containers/releases/release-side-view';
import { ScanStatus } from '@src-v2/types/enums/scan-status';
import { PullRequestScanResponse } from '@src-v2/types/pull-request/pull-request-response';
import { Column } from '@src-v2/types/table';

export const PRLogsTableColumns: Column<PullRequestScanResponse>[] = [
  {
    key: 'risk-level',
    label: 'Risk',
    resizeable: false,
    draggable: false,
    width: 16,
    Cell: ({ data, ...props }) => (
      <Table.CenterCell {...props}>
        {data.scanStatus === ScanStatus.Pending ? (
          <LearningButton.Animation size={3} width={0.75} margin={2} />
        ) : data.scanStatus === ScanStatus.Diffed ? (
          <RiskIcon riskLevel={data.riskLevel} />
        ) : (
          <>WIP</>
        )}
      </Table.CenterCell>
    ),
  },
  {
    key: 'pr-number',
    label: 'PR #',
    width: '25rem',
    Cell: ({ data, ...props }) => <Table.Cell {...props}>{data.pullRequestId}</Table.Cell>,
  },
  {
    key: 'title',
    label: 'Title',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText lines={2}>{data.title}</ClampText>
      </Table.Cell>
    ),
  },
  {
    key: 'repository',
    label: 'Repository',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ConsumableProfileView profile={data.repository} />
      </Table.Cell>
    ),
  },
  {
    key: 'applications',
    label: 'Applications',
    hidden: true,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ApplicationsView applications={data.applications} />
      </Table.Cell>
    ),
  },
  {
    key: 'org-teams',
    label: 'Teams',
    hidden: true,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <TeamsView teams={data.orgTeams} />
      </Table.Cell>
    ),
  },
  {
    key: 'app-groups',
    label: 'Application groups',
    hidden: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props} item={ApplicationGroupProfileLink}>
        {data.applicationGroups}
      </TrimmedCollectionCell>
    ),
  },
  {
    key: 'comparison',
    label: 'Branches',
    Cell: styled(({ data, ...props }: { data: PullRequestScanResponse }) => (
      <Table.FlexCell {...props}>
        <ReleaseSideView side={data.candidate} /> → <ReleaseSideView side={data.baseline} />
      </Table.FlexCell>
    ))`
      gap: 1rem;
    `,
  },
  {
    key: 'pr-url',
    label: 'PR URL',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <PRExternalLink href={data.url}>
          <ClampText>{data.url}</ClampText>
        </PRExternalLink>
      </Table.FlexCell>
    ),
  },
  {
    key: 'last-scan-data',
    label: 'Last scan date',
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <DateTime format="HH:mm a" date={data.createdAt} />
        <DateTime format="PPP" date={data.createdAt} />
      </DoubleLinedCell>
    ),
  },
  {
    key: 'unblocked-at',
    label: 'Unblocked at',
    hidden: true,
    Cell: ({ data, ...props }) =>
      data.unblockedAt ? (
        <DoubleLinedCell {...props}>
          <DateTime format="HH:mm a" date={data.unblockedAt} />
          <DateTime format="PPP" date={data.unblockedAt} />
        </DoubleLinedCell>
      ) : (
        <Table.Cell {...props} />
      ),
  },
  {
    key: 'unblocked-by',
    label: 'Unblocked by',
    hidden: true,
    Cell: ({ data, ...props }) => (
      <Table.CenterCell {...props}>
        {Boolean(data.unblockedBy) && (
          <AvatarProfile showViewProfile={false} username={data.unblockedBy} />
        )}
      </Table.CenterCell>
    ),
  },
  {
    key: 'risks-count',
    label: 'Risks count',
    Cell: ({ data, ...props }) => <Table.Cell {...props}>{data.risksCount ?? 0}</Table.Cell>,
  },
];

const PRExternalLink = styled(ExternalLink)`
  max-width: 100%;
`;
