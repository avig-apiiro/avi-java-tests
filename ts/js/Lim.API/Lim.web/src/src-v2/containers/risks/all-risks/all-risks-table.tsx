import { observer } from 'mobx-react';
import { groupingColumnsMapper } from '@src-v2/containers/risks/groupings/grouping-table-content';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksGrouping } from '@src-v2/containers/risks/risks-grouping';
import { RisksTable } from '@src-v2/containers/risks/risks-table';
import { useInject, useQueryParams } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useDataTableGrouping } from '@src-v2/hooks/use-data-table-grouping';
import { useFilters } from '@src-v2/hooks/use-filters';
import { tableColumns } from './all-risks-table-content';

const AllRisksTableContent = observer(() => {
  const { session } = useInject();
  const { risksService } = useRisksContext();

  const { activeFilters } = useFilters();
  const { searchTerm, ...filters } = activeFilters;

  const dataModel = useDataTable(
    risksService.searchRisks,
    {
      key: `${session?.data?.environmentId}-all-risks`,
      columns: tableColumns,
      selectable: true,
      searchParams: { filters },
    },
    risksService.getTotalCount,
    risksService.getFilteredCount
  );

  return <RisksTable dataModel={dataModel} />;
});

export const AllRisksGrouping = observer(() => {
  const { session, allRisks } = useInject();
  const { queryParams } = useQueryParams();
  const groupBy = String(queryParams.group);

  const dataGroupingModel = useDataTableGrouping(allRisks.searchGroupingRisks, {
    key: `${session?.data?.environmentId}-all-risks-risks-${groupBy}`,
    columns: groupingColumnsMapper[groupBy as keyof typeof groupingColumnsMapper],
    groupBy,
  });

  return <RisksGrouping dataGroupingModel={dataGroupingModel} />;
});

export const AllRisksTable = observer(() => {
  const { queryParams } = useQueryParams();

  return queryParams.group ? <AllRisksGrouping /> : <AllRisksTableContent />;
});
