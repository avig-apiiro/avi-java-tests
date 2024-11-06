import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { IconButton } from '@src-v2/components/buttons';
import { LanguageStack } from '@src-v2/components/circles';
import { Counter } from '@src-v2/components/counter';
import { BaseIcon } from '@src-v2/components/icons';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { Table } from '@src-v2/components/table/table';
import { IconTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { EllipsisText, ExternalLink, Link, Paragraph } from '@src-v2/components/typography';
import { ConnectionsTable, SuggestionsCell } from '@src-v2/containers/connectors/connections-table';
import { IgnoreButton } from '@src-v2/containers/connectors/management/ignore-button';
import { MonitorToggle } from '@src-v2/containers/connectors/management/monitor-toggle';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { HelpModal } from '@src-v2/containers/modals/help-modal';
import { getLanguageDisplayName, isIgnoredLanguage } from '@src-v2/data/languages';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useLoading, useSuspense } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { Connection } from '@src-v2/types/connector/connectors';
import { StyledProps } from '@src-v2/types/styled';
import { makeUrl } from '@src-v2/utils/history-utils';

export const RepositoriesManagement = observer(() => {
  const { connectors } = useInject();
  const filterGroups = useSuspense(connectors.getRepositoriesFilterOptions, {
    isSingleConnection: false,
  });

  const dataModel = useDataTable(connectors.searchProviderRepositories, {
    columns: tableColumns,
  });

  useBreadcrumbs({ breadcrumbs: [{ label: 'Manage', to: '/connectors/manage', isPinned: true }] });

  return (
    <Page title="Manage Repositories">
      <Gutters>
        <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Repositories Management' }}>
          <ConnectionsTable
            dataModel={dataModel}
            filterGroups={filterGroups}
            searchItem={{ singular: 'repository', plural: 'repositories' }}>
            {row => <DataTable.Row key={row.key} data={row} />}
          </ConnectionsTable>
        </AnalyticsLayer>
      </Gutters>
    </Page>
  );
});

const repositoryRelevancyMap = {
  TooLarge: 'Repository is too large',
  KeyTooLong: 'Repository name is too long',
};

const isPerforce = (data: { server: Connection }) => data.server.provider === 'Perforce';

export const RepositoryCell = styled(
  observer(({ data, ...props }: StyledProps & { data: any }) => (
    <Table.FlexCell {...props}>
      <Tooltip content={`View ${data.name}`}>
        <NameContainer>
          {data.isIgnored || !data.isMonitored ? (
            <BranchName>{data.name}</BranchName>
          ) : (
            <RepositoryLink data={data}>{data.name}</RepositoryLink>
          )}
        </NameContainer>
      </Tooltip>
      {data.isActive && (
        <ActivityIndicator active={data.isActive} content="This repository is active" />
      )}
      {data.isArchived && <IconTooltip name="Archive" content="Repository archived" />}
      {data.url && !isPerforce(data) && (
        <Tooltip content="View repository">
          <ExternalLink href={data.url}>
            <IconButton name="External" />
          </ExternalLink>
        </Tooltip>
      )}
    </Table.FlexCell>
  ))
)`
  ${BaseIcon} {
    width: 5rem;
    height: 5rem;
  }
`;

const RepositoryLink = styled(
  observer(({ data, ...props }) => {
    const defaultBranchKey = data?.branches?.[data?.defaultBranch];
    const moreBranches = Object.keys(data?.branches ?? {}).filter(
      key => key !== data.defaultBranch
    );

    return data?.defaultBranch ? (
      <Link
        {...props}
        to={
          moreBranches.length || !defaultBranchKey
            ? makeUrl('/profiles/repositories', { fl: { searchTerm: data.name } })
            : `/profiles/repositories/${data?.branches?.[data?.defaultBranch]}/profile`
        }
      />
    ) : (
      <span {...props} />
    );
  })
)`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const SuggestedCell = observer(({ data, ...props }) => {
  const [modalElement, setModal, closeModal] = useModalState();

  const handleClick = useCallback(
    () => setModal(<HelpModal onClose={closeModal} />),
    [setModal, closeModal]
  );

  return (
    <SuggestionsCell {...props}>
      {data.hasWarnings && (
        <IconTooltip
          name="Info"
          onClick={handleClick}
          content={
            data.tooLargeBranches?.length ? (
              <>
                {data.tooLargeBranches.map(branchName => (
                  <Paragraph key={branchName}>
                    Error monitoring {branchName} branch: Repository is too large
                  </Paragraph>
                ))}
              </>
            ) : (
              <>
                <Paragraph>Repository could not be monitored</Paragraph>
                <Paragraph>Reason: {repositoryRelevancyMap[data.relevancyStatus]}</Paragraph>
              </>
            )
          }
        />
      )}
      {data.isRecommended && (
        <IconTooltip
          name="Star"
          content={
            <>
              <Paragraph>Recommended for being learned</Paragraph>
              <Paragraph>This repository is more active than others</Paragraph>
            </>
          }
        />
      )}
      {modalElement}
    </SuggestionsCell>
  );
});

export const MonitorBranchCell = styled(
  observer(({ data, ...props }: StyledProps & { data: any }) => {
    // sorting so default branch will always be first
    const branchesKeys = Object.keys(data.branches ?? {})
      .map(key => decodeURIComponent(key))
      .sort((a, b) => (a === data.defaultBranch ? -1 : b === data.defaultBranch ? 1 : 0));
    const { state } = useLocation();

    const to = {
      pathname: `/connectors/manage/server/${encodeURIComponent(data.serverUrl)}/repositories/${data.key}/multi-branch`,
      state,
    };

    return (
      <Table.FlexCell {...props}>
        {data.isMonitored && !isPerforce(data) && (
          <>
            <DefaultBranchName>{branchesKeys[0]}</DefaultBranchName>
            {branchesKeys.length > 1 && (
              <Tooltip
                content={
                  <>
                    {branchesKeys.slice(1).map(key => (
                      <BranchName key={key}>{key}</BranchName>
                    ))}
                  </>
                }>
                <Counter>+{branchesKeys.length - 1}</Counter>
              </Tooltip>
            )}

            <Tooltip content="Manage monitored branches">
              <Link to={to}>
                <IconButton name="Settings" />
              </Link>
            </Tooltip>
          </>
        )}
      </Table.FlexCell>
    );
  })
)`
  gap: 2rem;

  ${Counter} {
    &:hover {
      background-color: var(--color-blue-gray-10);
    }
  }
`;

const DefaultBranchName = styled.span`
  max-width: 50rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const BranchName = styled(Paragraph)`
  max-width: 100rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 0;
`;

const ServerUrlCell = styled(Table.FlexCell)`
  ${ExternalLink} {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const NameContainer = styled(EllipsisText)`
  display: flex;
`;

export const MonitoringCell = observer(({ data, ...props }) => {
  const { application, connectors, toaster, rbac } = useInject();

  const [handleMonitorToggle, loading] = useLoading(async () => {
    try {
      await connectors.toggleMonitoredProviderRepository(data);
      await application.fetchIntegrations();
    } catch (error) {
      toaster.error('Failed to change monitor status, please try again');
    }
  }, [data]);

  return (
    <Table.FlexCell {...props}>
      <IgnoreButton data={data} />
      {!data.isIgnored && (
        <MonitorToggle
          data={data}
          loading={loading}
          disabled={!rbac.canEdit(resourceTypes.Connectors)}
          onChange={handleMonitorToggle}
        />
      )}
    </Table.FlexCell>
  );
});

export const LanguagesCell = observer(({ data, ...props }) => {
  const languages = useMemo(
    () =>
      data.languages
        ?.filter(language => !isIgnoredLanguage(language))
        .map(language => ({
          name: getLanguageDisplayName(language),
          icon: language,
        })),
    [data]
  );

  return (
    <Table.Cell {...props}>
      <LanguageStack languages={languages} size={Size.MEDIUM} />
    </Table.Cell>
  );
});

const tableColumns = [
  {
    label: 'Monitoring',
    width: '30rem',
    resizeable: false,
    Cell: MonitoringCell,
  },
  { label: 'Suggested', width: '26rem', resizeable: false, Cell: SuggestedCell },
  { label: 'Name', minWidth: '20rem', Cell: RepositoryCell },
  { label: 'Monitored branches', width: '40rem', Cell: MonitorBranchCell },
  {
    label: 'Repository group',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <EllipsisText>{data.projectId}</EllipsisText>
      </Table.Cell>
    ),
  },
  {
    label: 'Privacy',
    width: '20rem',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>{data.isPublicPrivacy ? 'Public' : 'Private'}</Table.Cell>
    ),
  },
  {
    label: 'Server URL',
    minWidth: '20rem',
    Cell: ({ data, ...props }) => (
      <>
        {isPerforce(data) ? (
          <Table.Cell {...props}>{data.serverUrl}</Table.Cell>
        ) : (
          <ServerUrlCell {...props}>
            <Tooltip content={data.serverUrl}>
              <ExternalLink href={data.serverUrl}>{data.serverUrl}</ExternalLink>
            </Tooltip>
          </ServerUrlCell>
        )}
      </>
    ),
  },
  {
    label: 'Languages',
    width: '35rem',
    Cell: LanguagesCell,
  },
];
