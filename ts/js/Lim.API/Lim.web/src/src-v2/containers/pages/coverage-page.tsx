import { useMemo } from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import {
  ApplicationsCell,
  IconMapperCell,
  LastCommitCell,
  RepositoryCell,
} from '@src-v2/components/coverage-table/coverage-cells';
import { CoverageTable } from '@src-v2/components/coverage-table/coverage-table';
import { ConditionalProviderIcon } from '@src-v2/components/icons';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { LanguagesCell } from '@src-v2/containers/connectors/management/repositories-management';
import { TagCell } from '@src-v2/containers/risks/risks-common-cells';
import { useInject, useLoading, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useFilters } from '@src-v2/hooks/use-filters';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export default function CoveragePage() {
  const { coverage, session } = useInject();
  const connectedProvidersNested = useSuspense(coverage.getConnectedProvidersAndGroups);
  const nestedProvidersKeys = Object.keys(connectedProvidersNested ?? {});

  const activeProviderColumnsNested = useMemo(
    () =>
      nestedProvidersKeys?.map(provider => ({
        key: provider,
        label: provider,
        minWidth: '25rem',
        Cell: ({ data, ...props }: { data: StubAny }) => (
          <IconMapperCell {...props} data={data} providerKey={provider} />
        ),
        nestedColumns: connectedProvidersNested[provider].map(
          (providerAndDisplayName: StubAny) => ({
            key: providerAndDisplayName.provider,
            width: '14rem',
            Cell: ({ data, ...props }: { data: StubAny }) => (
              <IconMapperCell
                {...props}
                data={data}
                providerKey={providerAndDisplayName.provider}
              />
            ),
            label: (
              <Tooltip content={providerAndDisplayName.displayName}>
                <IconLabel>
                  <ConditionalProviderIcon name={providerAndDisplayName.provider} />
                </IconLabel>
              </Tooltip>
            ),
          })
        ),
      })) ?? [],
    [connectedProvidersNested]
  );

  const dataModel = useDataTable(coverage.searchCoverage, {
    key: `${session?.data?.environmentId}-coverage-table`,
    columns: [...tableColumns, ...activeProviderColumnsNested],
    selectable: true,
  });

  const { activeFilters } = useFilters();

  const [handleExport, loading] = useLoading(
    async () => await coverage.exportCoverage(activeFilters),
    [activeFilters]
  );

  return (
    <Page title="Coverage Page">
      <StickyHeader />
      <Gutters>
        <AsyncBoundary>
          <CoverageTable dataModel={dataModel} handleExport={handleExport} loading={loading} />
        </AsyncBoundary>
      </Gutters>
    </Page>
  );
}

const tableColumns: Column<StubAny>[] = [
  { key: 'repository', label: 'Repository', Cell: RepositoryCell },
  { key: 'lastCommit', label: 'Last commit', Cell: LastCommitCell },
  { key: 'applications', label: 'Applications', Cell: ApplicationsCell },
  { key: 'languages', label: 'Languages', Cell: LanguagesCell },
  {
    key: 'repository-tag',
    label: 'Repository tag',
    Cell: ({ data }) => <TagCell tags={data.repositoryTags} />,
    hidden: true,
    betaFeature: FeatureFlag.RepositoryTagFilter,
  },
  {
    key: 'application-tag',
    label: 'Application tag',
    Cell: ({ data }) => <TagCell tags={data.applicationTags} />,
    hidden: true,
    betaFeature: FeatureFlag.ApplicationTagFilter,
  },
];

const IconLabel = styled.div`
  display: flex;
  justify-content: center;
`;
