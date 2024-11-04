import { useCallback } from 'react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { ClampPath } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { Table } from '@src-v2/components/table/table';
import { InsightsCell } from '@src-v2/components/table/table-common-cells/insights-cell';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { PipelineTable } from '@src-v2/containers/pages/pipelines/pipeline-table';
import { useInject } from '@src-v2/hooks';
import { CICDServerDependency } from '@src-v2/types/pipelines/pipelines-types';
import { PipelineDependencyPane } from './pipeline-dependency-pane/pipeline-dependency-pane';

export const ServerDependencies = ({ serverUrl }: { serverUrl: string }) => {
  const { pipelines } = useInject();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'server-dependencies-table' }}>
      <PipelineTable
        serverUrl={serverUrl}
        tableColumns={tableColumns}
        filterFetcher={pipelines.getServersDependenciesFilterOptions}
        dataFetcher={pipelines.searchCICDServerDependencies}
        itemTypeDisplayName={{ singular: 'dependency', plural: 'dependencies' }}
        pipelineRow={({ data, ...props }) => (
          <ServerDependencyRow data={data} serverUrl={serverUrl} {...props} />
        )}
      />
    </AnalyticsLayer>
  );
};

const ServerDependencyRow = ({
  data,
  serverUrl,
  ...props
}: {
  data: CICDServerDependency;
  serverUrl: string;
}) => {
  const { pushPane } = usePaneState();

  const handleOpenPane = useCallback(() => {
    pushPane(
      <PipelineDependencyPane name={data.name} version={data.version} serverUrl={serverUrl} />
    );
  }, [pushPane]);

  return <DataTable.Row {...props} data={data} onClick={handleOpenPane} />;
};

export const tableColumns = [
  {
    label: 'Dependency name',
    Cell: ({ data, ...props }: { data: CICDServerDependency }) => (
      <Table.FlexCell {...props}>
        <ClampPath>{data.name}</ClampPath>
      </Table.FlexCell>
    ),
  },
  {
    label: 'Version',
    Cell: ({ data, ...props }: { data: CICDServerDependency }) => (
      <Table.FlexCell {...props}>{data.version}</Table.FlexCell>
    ),
  },
  {
    label: 'Technology',
    Cell: ({ data }: { data: CICDServerDependency }) => (
      <Table.FlexCell>
        <VendorIcon name={data.provider} />
        {data.cicdTechnology}
      </Table.FlexCell>
    ),
  },
  {
    label: 'Insights',
    Cell: ({ data, ...props }: { data: CICDServerDependency }) => (
      <InsightsCell {...props} insights={data.insights} filterKey="RiskInsights" />
    ),
  },
];
