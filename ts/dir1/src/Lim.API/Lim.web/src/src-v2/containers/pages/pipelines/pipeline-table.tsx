import { observer } from 'mobx-react';
import { FC } from 'react';
import styled from 'styled-components';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { ResultsCounter } from '@src-v2/components/persistent-search-state/persistent-search-filters';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { DataTable as _DataTable } from '@src-v2/containers/data-table/data-table';
import { TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { Filter, useFilters } from '@src-v2/hooks/use-filters';
import { DataTable as DataTableModel } from '@src-v2/models/data-table';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { CICDServerDependency, CICDServerPipeline } from '@src-v2/types/pipelines/pipelines-types';
import { Column } from '@src-v2/types/table';
import { dataAttr } from '@src-v2/utils/dom-utils';

interface PlainPipelineTableProps<
  T extends {
    key: string;
  },
  TMetadata,
> {
  dataModel: DataTableModel<T, TMetadata>;
  filterOptions?: Filter[];
  itemTypeDisplayName: { singular: string; plural?: string };
  row?: FC<{
    data: T;
  }>;
}

export const PipelineTable = observer(
  ({
    tableColumns,
    dataFetcher,
    filterFetcher,
    itemTypeDisplayName,
    pipelineRow: PipelineRow = DataTable.Row,
    serverUrl,
  }: {
    tableColumns: Column<CICDServerPipeline | CICDServerDependency>[];
    dataFetcher: (
      args: any
    ) => Promise<AggregationResult<CICDServerPipeline | CICDServerDependency>>;
    filterFetcher: () => Promise<Filter[]>;
    pipelineRow?: (data: any) => JSX.Element;
    itemTypeDisplayName: { singular: string; plural?: string };
    serverUrl: string;
  }) => {
    const {
      activeFilters: { searchTerm, ...filters },
    } = useFilters();

    const filterOptions = filterFetcher ? useSuspense(filterFetcher) : [];

    const dataModel = useDataTable(dataFetcher, {
      columns: tableColumns,
      searchParams: { filters, serverUrl },
    });

    return (
      <PlainPipelineTable
        dataModel={dataModel}
        filterOptions={filterOptions}
        itemTypeDisplayName={itemTypeDisplayName}
        row={rowProps => <PipelineRow {...rowProps} />}
      />
    );
  }
);

const DataTable = styled(_DataTable)`
  ${Table.Body} ${Table.Row} {
    height: 14rem;
  }

  ${Table.Cell}:last-child {
    padding-right: 2rem;
  }
`;

const PlainPipelineTable = observer(
  <
    T extends {
      key: string;
    },
    TMetadata = 0,
  >({
    dataModel,
    filterOptions,
    itemTypeDisplayName,
    row: Row = DataTable.Row,
  }: PlainPipelineTableProps<T, TMetadata>) => (
    <>
      <PipelineTableControls data-narrow={dataAttr(!filterOptions?.length)}>
        <TableSearch placeholder={`Search ${itemTypeDisplayName.singular}`} />
        {Boolean(filterOptions?.length) && (
          <TableControls.Filters>
            <FiltersControls filterOptions={filterOptions} />
          </TableControls.Filters>
        )}

        <TableControls.Counter>
          <ResultsCounter
            count={dataModel.searchState.count}
            total={dataModel.searchState.total}
            itemName={itemTypeDisplayName.plural ?? `${itemTypeDisplayName.singular}s`}
          />
        </TableControls.Counter>
      </PipelineTableControls>

      <DataTable expandable dataModel={dataModel}>
        {(item: T) => <Row key={item.key} data={item} />}
      </DataTable>

      {!dataModel.ignorePagination && dataModel.searchState.items.length > 0 && (
        <TablePagination searchState={dataModel.searchState} />
      )}
    </>
  )
);

const PipelineTableControls = styled(FluidTableControls)`
  &[data-narrow] ${TableControls.Filters} {
    grid-area: actions;
  }
`;
