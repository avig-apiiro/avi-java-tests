import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { Badge, BadgeColors } from '@src-v2/components/badges';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { ClampPath } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { ErrorLayout } from '@src-v2/components/layout';
import { BusinessImpactPopover } from '@src-v2/components/risk/risk-popovers';
import { useRiskProfile } from '@src-v2/components/risk/risk-utils';
import { Table } from '@src-v2/components/table/table';
import { TableHeader } from '@src-v2/components/table/table-header';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { EllipsisText, ExternalLink, Light, Link } from '@src-v2/components/typography';
import { BadgeWrapper } from '@src-v2/containers/pages/pipelines/components/pipeline-card';
import { RiskIconCell } from '@src-v2/containers/risks/risks-common-cells';
import { useTable } from '@src-v2/hooks/use-table';
import {
  CheckedOutRepositories,
  Pipeline,
  ResolvedCheckedOutRepositoryStatus,
} from '@src-v2/types/pipelines/pipelines-types';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { humanize } from '@src-v2/utils/string-utils';

interface CheckedOutRepositoryInfo extends CheckedOutRepositories {
  cicdTechnology: string;
}

export const PipelineRepository = ({ pipeline }: { pipeline: Pipeline }) => {
  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  return (
    <Table>
      <TableHeader tableModel={tableModel} />
      <Table.Body>
        {!pipeline?.checkedOutRepositories || pipeline?.checkedOutRepositories?.length === 0 ? (
          <Table.EmptyMessage colSpan={tableColumns.length}>
            <ErrorLayout.NoResults data-contained />
          </Table.EmptyMessage>
        ) : (
          pipeline?.checkedOutRepositories.map(repo => (
            <Table.Row key={repo.key}>
              {tableModel.columns?.map(({ Cell, ...column }) => (
                <Cell
                  key={`${column.label}-${repo.key}`}
                  data={{ ...repo, cicdTechnology: pipeline.cicdTechnology }}
                />
              ))}
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table>
  );
};

const PipelineRepositoryLinkLabel = styled.div`
  display: flex;
  align-items: center;
`;

export const tableColumns = [
  {
    label: 'Repository name',
    Cell: ({ data, ...props }: { data: CheckedOutRepositoryInfo }) => {
      const riskProfile = useRiskProfile(data);
      const [repositoryTitle, setRepositoryTitle] = useState(`${data.name} (${data.branch})`);
      const [repositoryNameTooltip, setRepositoryNameTooltip] = useState('');

      const repositoryName = useMemo(() => {
        if (!data.isValidRepositoryName) {
          return 'Unknown';
        }
        if (!data.isValidBranchName) {
          return `${data.name} (Unresolved branch name)`;
        }
        return null;
      }, [data.isValidRepositoryName, data.isValidBranchName, data.name]);

      const repositoryTooltip = useMemo(() => {
        if (!data.isValidRepositoryName) {
          return `Could not resolve repository name from variable: ${data.name} (${data.branch})`;
        }
        if (!data.isValidBranchName) {
          return `Could not resolve the name in variable (${data.branch})`;
        }
        return null;
      }, [data.isValidRepositoryName, data.isValidBranchName, data.branch, data.name]);

      useEffect(() => {
        repositoryName && setRepositoryTitle(repositoryName);
        repositoryTooltip && setRepositoryNameTooltip(repositoryTooltip);
      }, [repositoryName, repositoryTooltip]);

      return (
        <Table.FlexCell {...props}>
          <PipelineRepositoryCell>
            <Tooltip
              disabled={data.isValidBranchName && data.isValidRepositoryName}
              content={repositoryNameTooltip}>
              {data.status === ResolvedCheckedOutRepositoryStatus.Monitored ? (
                <>
                  <VendorIcon name={data.provider} />
                  <Link to={`/profiles/repositories/${data.key}`}>{repositoryTitle}</Link>
                </>
              ) : (
                <Light>{repositoryTitle}</Light>
              )}
            </Tooltip>
            {data.businessImpact && (
              <BusinessImpactPopover
                profile={{
                  ...riskProfile,
                  businessImpact: humanize(riskProfile.businessImpactLevel),
                }}>
                <BusinessImpactIndicator businessImpact={data.businessImpact} />
              </BusinessImpactPopover>
            )}
            {data.status === ResolvedCheckedOutRepositoryStatus.Monitored && (
              <ActivityIndicator active={data.isActive} />
            )}
          </PipelineRepositoryCell>
        </Table.FlexCell>
      );
    },
    minWidth: '40rem',
  },
  {
    label: 'Status',
    Cell: ({ data, ...props }: { data: CheckedOutRepositoryInfo }) => {
      const color =
        data.status === ResolvedCheckedOutRepositoryStatus.Unmatched ||
        data.status === ResolvedCheckedOutRepositoryStatus.Unmonitored
          ? BadgeColors.Red
          : BadgeColors.Blue;
      return (
        <Table.Cell {...props}>
          <BadgeWrapper>
            <Tooltip
              disabled={data.status !== ResolvedCheckedOutRepositoryStatus.Unmatched}
              content="Could not match this repository to a repository connected to Apiiro">
              <Badge key={data.key} color={color}>
                {data.status}
              </Badge>
            </Tooltip>
            {data.isParent && (
              <Tooltip content="This repository contains the pipeline configuration file">
                <Badge key={data.key} color={color}>
                  <EllipsisText>Parent repository</EllipsisText>
                </Badge>
              </Tooltip>
            )}
          </BadgeWrapper>
        </Table.Cell>
      );
    },
    minWidth: '40rem',
  },
  {
    label: (
      <PipelineRepositoryLinkLabel>
        Repository link
        <InfoTooltip content="The repository link may not be available for repositories that were not matched" />
      </PipelineRepositoryLinkLabel>
    ),
    Cell: ({ data, ...props }: { data: CheckedOutRepositoryInfo }) => {
      const isValidLink = useMemo(() => {
        return data.link && data.linkErrorMessage.length === 0;
      }, [data.link, data.linkErrorMessage]);
      const repositoryUrl = useMemo(() => {
        return isValidLink ? data.link : 'Unknown';
      }, [isValidLink, data.link]);
      return (
        <Table.FlexCell {...props}>
          {isValidLink ? (
            <RepositoryLink onClick={stopPropagation} href={data.link}>
              <ClampPath>{repositoryUrl}</ClampPath>
            </RepositoryLink>
          ) : (
            <Tooltip content={data.linkErrorMessage}>
              <Light>{repositoryUrl}</Light>
            </Tooltip>
          )}
        </Table.FlexCell>
      );
    },
  },
  {
    label: 'Repository group',
    Cell: ({ data, ...props }: { data: CheckedOutRepositoryInfo }) => (
      <Table.Cell {...props}>{data.repositoryGroup}</Table.Cell>
    ),
  },
  {
    label: '# Commits',
    Cell: ({ data, ...props }: { data: CheckedOutRepositoryInfo }) => (
      <Table.Cell {...props}>{data.commitCount}</Table.Cell>
    ),
    width: '30rem',
  },
  {
    label: 'Risk',
    Cell: props => <RiskIconCell {...props} />,
    width: '25rem',
  },
];

const PipelineRepositoryCell = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RepositoryLink = styled(ExternalLink)`
  width: 100%;
`;
