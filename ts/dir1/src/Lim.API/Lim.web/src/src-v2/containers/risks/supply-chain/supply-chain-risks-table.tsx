import { observer } from 'mobx-react';
import { groupingColumnsMapper } from '@src-v2/containers/risks/groupings/grouping-table-content';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksGrouping } from '@src-v2/containers/risks/risks-grouping';
import { RisksTable } from '@src-v2/containers/risks/risks-table';
import { useInject, useQueryParams } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useDataTableGrouping } from '@src-v2/hooks/use-data-table-grouping';
import { useFilters } from '@src-v2/hooks/use-filters';
import { tableColumns } from '../all-risks/all-risks-table-content';

const SupplyChainRisksContent = observer(() => {
  const { session } = useInject();
  const { risksService } = useRisksContext();

  const {
    activeFilters: { searchTerm, ...filters },
  } = useFilters();

  const dataModel = useDataTable(
    risksService.searchRisks,
    {
      key: `${session?.data?.environmentId}-supply-chain`,
      columns: tableColumns,
      selectable: true,
      searchParams: { path: 'risk/supplyChain', filters },
    },
    risksService.getTotalCount,
    risksService.getFilteredCount
  );

  return <RisksTable dataModel={dataModel} />;
});

export const SupplyChainRisksGrouping = observer(() => {
  const { session, supplyChainRisks } = useInject();
  const { queryParams } = useQueryParams();
  const groupBy = String(queryParams.group);

  const dataGroupingModel = useDataTableGrouping(supplyChainRisks.searchGroupingRisks, {
    key: `${session?.data?.environmentId}-supply-chain-risks-${groupBy}`,
    columns: groupingColumnsMapper[groupBy as keyof typeof groupingColumnsMapper],
    groupBy,
  });

  return <RisksGrouping dataGroupingModel={dataGroupingModel} />;
});

export const SupplyChainRisksTable = observer(() => {
  const { queryParams } = useQueryParams();

  return queryParams.group ? <SupplyChainRisksGrouping /> : <SupplyChainRisksContent />;
});
