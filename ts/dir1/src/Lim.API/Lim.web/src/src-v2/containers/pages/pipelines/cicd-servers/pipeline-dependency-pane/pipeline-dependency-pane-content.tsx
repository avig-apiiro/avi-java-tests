import { AboutDependencyCard } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/about-dependency-card';
import { usePipelineDependencyContext } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/pipeline-dependency-context-provider';
import { VulnerabilitiesCards } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/vulnerabilities-card';
import { ControlledCardProps } from '@src/src-v2/components/cards/controlled-card';

export const PipelineDependencyPaneContent = (props: ControlledCardProps) => {
  const { serverDependencyInfo } = usePipelineDependencyContext();

  return (
    <>
      <AboutDependencyCard {...props} />
      {Boolean(serverDependencyInfo.vulnerabilities?.length) && <VulnerabilitiesCards {...props} />}
    </>
  );
};
