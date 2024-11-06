import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { VendorIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { Size } from '@src-v2/components/types/enums/size';
import { PipelineTable } from '@src-v2/containers/pages/pipelines/pipeline-table';
import { useInject } from '@src-v2/hooks';
import { CICDServerPipeline } from '@src-v2/types/pipelines/pipelines-types';

export const ServerPipelines = ({ serverUrl }: { serverUrl: string }) => {
  const { pipelines } = useInject();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'server-pipelines-table' }}>
      <PipelineTable
        serverUrl={serverUrl}
        tableColumns={tableColumns}
        filterFetcher={null}
        dataFetcher={pipelines.searchCICDServerPipelines}
        itemTypeDisplayName={{ singular: 'pipeline', plural: 'pipelines' }}
      />
    </AnalyticsLayer>
  );
};

export const tableColumns = [
  {
    label: 'Pipeline ID',
    Cell: ({ data }: { data: CICDServerPipeline }) => (
      <Table.FlexCell>{data.pipelineId}</Table.FlexCell>
    ),
  },
  {
    label: 'Technology',
    Cell: ({ data }: { data: CICDServerPipeline }) => (
      <Table.FlexCell>
        <VendorIcon name={data.cicdTechnology} size={Size.SMALL} /> {data.cicdTechnology}
      </Table.FlexCell>
    ),
  },
];
