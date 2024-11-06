import { PipelineCard } from '@src-v2/containers/pages/pipelines/components/pipeline-card';
import { PlainPipelinePage } from '@src-v2/containers/pages/pipelines/plain-pipeline-page';
import { useInject } from '@src-v2/hooks';

export default () => {
  const { pipelines } = useInject();

  return (
    <PlainPipelinePage
      title="Pipelines"
      filterItemTypeDisplayName={{ singular: 'pipeline', plural: 'pipelines' }}
      searchItemTypeDisplayName="pipelines"
      dataFetcher={pipelines.searchPipelines}
      filterFetcher={pipelines.getPipelinesFilterOptions}
      cardToRender={PipelineCard}
    />
  );
};
