import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import {
  NoVendorTooltipContent,
  VendorTooltipContent,
} from '@src-v2/components/coverage-table/coverage-tooltips';
import { SvgIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { DateTime, OptionalDate } from '@src-v2/components/time';
import { Popover } from '@src-v2/components/tooltips/popover';
import {
  ApplicationsView,
  ConsumableProfileView,
} from '@src-v2/containers/profiles/consumable-profiles-view';
import { dateFormats } from '@src-v2/data/datetime';
import { ProjectType } from '@src-v2/services';

export const IconMapperCell = ({
  data,
  providerKey,
  ...props
}: {
  data: any;
  providerKey: string;
}) => {
  const currentProviderProjects = useMemo(() => data.providers?.[providerKey], [data]);
  const project = chooseProject(currentProviderProjects);
  const extraProjectsCount =
    currentProviderProjects?.length ?? 0 <= 1 ? 0 : currentProviderProjects.length - 1;
  return (
    <ProviderCell {...props}>
      {isSuccessfulProject(project) ? (
        <IconPopover
          interactiveBorder={10}
          content={
            <VendorTooltipContent
              item={data}
              providerGroup={providerKey}
              project={project}
              extraProjectsCount={extraProjectsCount}
            />
          }>
          <MatchedIcon name="Success" data-scan-type={getSuccessfulScanType(project)} />
        </IconPopover>
      ) : (
        <IconPopover
          content={
            <NoVendorTooltipContent item={data} project={project} providerGroup={providerKey} />
          }>
          <MatchedIcon name="Failure" data-scan-type="unmatched" />
        </IconPopover>
      )}
    </ProviderCell>
  );
};

export const RepositoryCell = ({ data, ...props }) => (
  <Table.FlexCell {...props}>
    <ConsumableProfileView
      profile={data.repositoryProfile}
      isActive={data.isActive}
      showArchivedIndicator={data.isArchived}
      monitorStatus={data.monitorStatus}
      ignoredBy={data.ignoredBy}
      ignoreReason={data.ignoreReason}
      lastMonitoringChangeTimestamp={data.lastMonitoringChangeTimestamp}
    />
  </Table.FlexCell>
);

export const LastCommitCell = ({ data, ...props }) => (
  <Table.FlexCell {...props}>
    {data.lastCommit ? <DateTime date={data.lastCommit} format={dateFormats.longDate} /> : 'Never'}
  </Table.FlexCell>
);

export const ApplicationsCell = ({ data, ...props }) => (
  <Table.FlexCell {...props}>
    {Boolean(data.applications?.length) && <ApplicationsView applications={data.applications} />}
  </Table.FlexCell>
);

const ProviderCell = styled(Table.FlexCell)`
  justify-content: center;
`;

export const MatchedIcon = styled(SvgIcon)`
  &[data-name='Success'] {
    color: var(--color-green-50);
  }

  &[data-scan-type='old'] {
    color: var(--color-blue-gray-40);
  }

  &[data-scan-type='unmatched'] {
    fill: var(--color-red-50);
    color: var(--color-white);
  }
`;

export const IconPopover = styled(Popover)`
  color: var(--color-white);
  background-color: var(--color-blue-gray-70);

  ${Popover.Arrow} {
    &:before {
      background-color: var(--color-blue-gray-70);
    }
  }
`;

const chooseProject = (allProjects: ProjectType[]) => {
  if (!allProjects?.length) {
    return null;
  }

  const successfulProjects = allProjects.filter(project => isSuccessfulProject(project));
  if (!successfulProjects.length) {
    return allProjects[0];
  }

  return _.maxBy(successfulProjects, 'lastScan');
};

const isSuccessfulProject = (project: ProjectType) => {
  return (
    project &&
    project.lastScan &&
    project.scanCoverage !== 'None' &&
    !project.tooltipFailureOverrideText
  );
};

const getSuccessfulScanType = (project: ProjectType): string =>
  lastScanInInterval(project) ? 'full' : 'old';

const lastScanInInterval = (project: ProjectType) =>
  project &&
  (project.isRecentScan ?? (project.lastScan && getDaysSinceLastScan(project.lastScan) <= 90));

const getDaysSinceLastScan = (lastScan: OptionalDate): number =>
  (new Date().valueOf() - new Date(lastScan).valueOf()) / (1000 * 60 * 60 * 24.0);
