import { useMemo } from 'react';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { Page } from '@src-v2/components/layout/page';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { PipelineApplications } from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipeline-applications';
import { PipelineDependencies } from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipeline-dependencies';
import { PipelineRepository } from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipeline-repository';
import { PipelineSecrets } from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipeline-secrets';
import { preparePipelineDependencyTable } from '@src-v2/containers/pages/pipelines/cicd-pipelines/transformers';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';

export const PipelineInventoryPage = () => {
  const { pipelines, rbac } = useInject();
  const { pipelineKey } = useParams<{ pipelineKey: string }>();
  const pipeline = useSuspense(pipelines.getPipeline, { key: pipelineKey });
  const { path: basePath, url: baseUrl } = useRouteMatch();

  const pipelineDependencyTable = useMemo(
    () =>
      preparePipelineDependencyTable(pipeline.dependencies, pipeline.id, {
        provider: pipeline.declaringRepositoryProviderGroup,
        referenceName: pipeline.declaringRepositoryBranchName,
        url: pipeline.repositoryUrl,
      }),
    [pipeline]
  );

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <Page title={pipeline.id}>
      <PipelineStickyHeader>
        <Tabs
          tabs={[
            {
              key: 'repositories',
              label: `Checked-out repositories (${pipeline.checkedOutRepositories?.length})`,
              to: 'repositories',
            },
            {
              key: 'dependencies',
              label: `Dependencies (${pipelineDependencyTable.length})`,
              to: 'dependencies',
            },
            { key: 'secrets', label: `Secrets (${pipeline.secrets?.length})`, to: 'secrets' },
            {
              key: 'applications',
              label: `Applications (${pipeline.applications?.length})`,
              to: 'applications',
            },
          ]}
          variant={Variant.SECONDARY}
        />
      </PipelineStickyHeader>
      <Switch>
        <Route path={`${basePath}/repositories`}>
          <PipelineRepository pipeline={pipeline} />
        </Route>
        <Route path={`${basePath}/dependencies`}>
          <PipelineDependencies pipelineDependencyTable={pipelineDependencyTable} />
        </Route>
        <Route path={`${basePath}/secrets`}>
          <PipelineSecrets pipeline={pipeline} />
        </Route>
        <Route path={`${basePath}/applications`}>
          <PipelineApplications pipeline={pipeline} />
        </Route>
        <Redirect to={`${baseUrl}/repositories`} />
      </Switch>
    </Page>
  );
};

const PipelineStickyHeader = styled.div`
  margin: 4rem 0 5rem;
`;
