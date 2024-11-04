import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { pipelinesRisksTableColumns } from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipelines-risks-table-content';
import { groupingColumnsMapper } from '@src-v2/containers/risks/groupings/grouping-table-content';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksGrouping } from '@src-v2/containers/risks/risks-grouping';
import { RisksTable } from '@src-v2/containers/risks/risks-table';
import { useInject, useQueryParams, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useDataTableGrouping } from '@src-v2/hooks/use-data-table-grouping';

const PipelinesRisksContent = observer(() => {
  const { session, pipelines } = useInject();
  const { risksService } = useRisksContext();
  const { pipelineKey } = useParams<{ pipelineKey: string }>();
  const pipeline = useSuspense(pipelines.getPipeline, { key: pipelineKey });

  const dataModel = useDataTable(
    risksService.searchRisks,
    {
      key: `${session?.data?.environmentId}-pipelines-risks`,
      columns: pipelinesRisksTableColumns,
      selectable: true,
      searchParams: {
        // risks view under pipelines represents supplyChain table filtered by pipelineId
        profileKey: pipeline.declaringRepositoryKey
          ? pipeline.declaringRepositoryKey
          : pipeline.key,
        profileType: 'RepositoryProfile',
        pipelinesEntityIds: pipeline.entityId ? pipeline.entityId : pipeline.key,
      },
    },
    risksService.getTotalCount,
    risksService.getFilteredCount
  );

  return (
    <RisksTable dataModel={dataModel} filterOptionsFetcherParams={{ pipelineFilters: true }} />
  );
});

const PipelinesRisksGrouping = observer(() => {
  const { session, supplyChainRisks, pipelines } = useInject();
  const { queryParams } = useQueryParams();
  const { pipelineKey } = useParams<{ pipelineKey: string }>();
  const pipeline = useSuspense(pipelines.getPipeline, { key: pipelineKey });
  const groupBy = String(queryParams.group);

  const searchParams = {
    // risks view under pipelines represents supplyChain tables filtered by pipelineId
    profileKey: pipeline.declaringRepositoryKey ? pipeline.declaringRepositoryKey : pipeline.key,
    profileType: 'RepositoryProfile',
    pipelinesEntityIds: pipeline.entityId ? pipeline.entityId : pipeline.key,
  };

  const dataGroupingModel = useDataTableGrouping(supplyChainRisks.searchGroupingRisks, {
    key: `${session?.data?.environmentId}-supply-chain-risks-${groupBy}`,
    columns: groupingColumnsMapper[groupBy],
    groupBy,
    searchParams,
  });

  return <RisksGrouping dataGroupingModel={dataGroupingModel} />;
});

export const PipelinesRisksTable = observer(() => {
  const { queryParams } = useQueryParams();
  return queryParams.group ? <PipelinesRisksGrouping /> : <PipelinesRisksContent />;
});
