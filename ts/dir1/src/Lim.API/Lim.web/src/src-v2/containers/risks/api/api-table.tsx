import { observer } from 'mobx-react';
import { apiTableColumns } from '@src-v2/containers/risks/api/api-table-content';
import { groupingColumnsMapper } from '@src-v2/containers/risks/groupings/grouping-table-content';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksGrouping } from '@src-v2/containers/risks/risks-grouping';
import { RisksTable } from '@src-v2/containers/risks/risks-table';
import { useInject, useQueryParams } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useDataTableGrouping } from '@src-v2/hooks/use-data-table-grouping';
import { useFilters } from '@src-v2/hooks/use-filters';

const ApiTableContent = observer(() => {
  const { session } = useInject();
  const { risksService } = useRisksContext();

  const { activeFilters } = useFilters();
  const { searchTerm, ...filters } = activeFilters;

  const dataModel = useDataTable(
    risksService.searchRisks,
    {
      key: `${session?.data?.environmentId}-api-risks`,
      columns: apiTableColumns,
      selectable: true,
      searchParams: { filters },
    },
    risksService.getTotalCount,
    risksService.getFilteredCount
  );

  return <RisksTable dataModel={dataModel} />;
});

const ApiRisksGrouping = observer(() => {
  const { session, apiRisks } = useInject();
  const { queryParams } = useQueryParams();
  const groupBy = String(queryParams.group);

  const dataGroupingModel = useDataTableGrouping(apiRisks.searchGroupingRisks, {
    key: `${session?.data?.environmentId}-api-risks-${groupBy}`,
    columns: groupingColumnsMapper[groupBy as keyof typeof groupingColumnsMapper],
    groupBy,
  });

  return <RisksGrouping dataGroupingModel={dataGroupingModel} />;
});

export const ApiRisksTable = observer(() => {
  const { queryParams } = useQueryParams();

  return queryParams.group ? <ApiRisksGrouping /> : <ApiTableContent />;
});
