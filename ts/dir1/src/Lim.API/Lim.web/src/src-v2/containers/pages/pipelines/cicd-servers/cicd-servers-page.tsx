import { CICDServerCard } from '@src-v2/containers/pages/pipelines/components/cicd-server-card';
import { PlainPipelinePage } from '@src-v2/containers/pages/pipelines/plain-pipeline-page';
import { useInject } from '@src-v2/hooks';

export default () => {
  const { pipelines } = useInject();

  return (
    <PlainPipelinePage
      title="CI/CD servers"
      filterItemTypeDisplayName={{ singular: 'server', plural: 'servers' }}
      searchItemTypeDisplayName="CI/CD servers"
      dataFetcher={pipelines.searchCICDServers}
      filterFetcher={pipelines.getServersFilterOptions}
      cardToRender={CICDServerCard}
    />
  );
};
