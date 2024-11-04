import { observer } from 'mobx-react';
import { groupingColumnsMapper } from '@src-v2/containers/risks/groupings/grouping-table-content';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksGrouping } from '@src-v2/containers/risks/risks-grouping';
import { RisksTable } from '@src-v2/containers/risks/risks-table';
import { useInject, useQueryParams } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useDataTableGrouping } from '@src-v2/hooks/use-data-table-grouping';
import { useFilters } from '@src-v2/hooks/use-filters';
import { tableColumns } from './sca-table-content';

const ScaRisksContent = observer(() => {
  const { session } = useInject();
  const { risksService } = useRisksContext();

  const {
    activeFilters: { searchTerm, ...filters },
  } = useFilters();

  const dataModel = useDataTable(
    risksService.searchRisks,
    {
      key: `${session?.data?.environmentId}-oss-risks`,
      columns: tableColumns,
      selectable: true,
      searchParams: { path: 'risk/oss', filters: { ...filters } },
    },
    risksService.getTotalCount,
    risksService.getFilteredCount
  );

  return <RisksTable dataModel={dataModel} />;
});

const ScaRisksGrouping = observer(() => {
  const { session, ossRisks } = useInject();
  const { queryParams } = useQueryParams();
  const groupBy = String(queryParams.group);

  const dataGroupingModel = useDataTableGrouping(ossRisks.searchGroupingRisks, {
    key: `${session?.data?.environmentId}-sca-risks-${groupBy}`,
    columns: groupingColumnsMapper[groupBy as keyof typeof groupingColumnsMapper],
    groupBy,
  });

  return <RisksGrouping dataGroupingModel={dataGroupingModel} />;
});

export const OssRisksTable = observer(() => {
  const { queryParams } = useQueryParams();
  return queryParams.group ? <ScaRisksGrouping /> : <ScaRisksContent />;
});
