import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { artifactRiskTableColumns } from '@src-v2/containers/pages/artifacts/artifact-risks-table-content';
import { groupingColumnsMapper } from '@src-v2/containers/risks/groupings/grouping-table-content';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksGrouping } from '@src-v2/containers/risks/risks-grouping';
import { RisksTable } from '@src-v2/containers/risks/risks-table';
import { useInject, useQueryParams, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useDataTableGrouping } from '@src-v2/hooks/use-data-table-grouping';

const ArtifactsRisksContent = observer(() => {
  const { session, artifacts } = useInject();
  const { risksService } = useRisksContext();
  const { artifactKey } = useParams<{ artifactKey: string }>();
  const artifact = useSuspense(artifacts.getArtifact, { key: artifactKey });

  const dataModel = useDataTable(
    risksService.searchRisks,
    {
      key: `${session?.data?.environmentId}-artifact-dependency-findings-risks`,
      columns: artifactRiskTableColumns,
      selectable: true,
      searchParams: {
        profileKey: artifact.key,
        profileType: 'ArtifactMultiSourcedEntity',
      },
    },
    risksService.getTotalCount,
    risksService.getFilteredCount
  );

  return (
    <RisksTable dataModel={dataModel} filterOptionsFetcherParams={{ profileKey: artifact.key }} />
  );
});

const ArtifactsRisksGrouping = observer(() => {
  const { session, artifactDependencyFindingsRisks, artifacts } = useInject();
  const { queryParams } = useQueryParams();
  const { artifactKey } = useParams<{ artifactKey: string }>();
  const artifact = useSuspense(artifacts.getArtifact, { key: artifactKey });
  const groupBy = String(queryParams.group);

  const searchParams = {
    profileKey: artifact.key,
    profileType: 'ArtifactMultiSourcedEntity',
  };

  const dataGroupingModel = useDataTableGrouping(
    artifactDependencyFindingsRisks.searchGroupingRisks,
    {
      key: `${session?.data?.environmentId}-artifact-dependency-findings-${groupBy}`,
      columns: groupingColumnsMapper[groupBy],
      groupBy,
      searchParams,
    }
  );

  return <RisksGrouping dataGroupingModel={dataGroupingModel} />;
});

export const ArtifactsRisksTable = observer(() => {
  const { queryParams } = useQueryParams();
  return queryParams.group ? <ArtifactsRisksGrouping /> : <ArtifactsRisksContent />;
});
