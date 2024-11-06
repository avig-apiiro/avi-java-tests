import { observer } from 'mobx-react';
import { FC } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { SvgIcon } from '@src-v2/components/icons';
import { ResultsCounter } from '@src-v2/components/persistent-search-state/persistent-search-filters';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable as _DataTable } from '@src-v2/containers/data-table/data-table';
import { TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { Filter, useFilters } from '@src-v2/hooks/use-filters';
import { DataTable as DataTableModel } from '@src-v2/models/data-table';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { Column } from '@src-v2/types/table';
import { dataAttr } from '@src-v2/utils/dom-utils';

interface ArtifactsPlainTableProps<
  T extends {
    key: string;
  },
  TMetadata,
> {
  dataModel: DataTableModel<T, TMetadata>;
  filterOptions?: Filter[];
  searchable?: boolean;
  itemTypeDisplayName: { singular: string; plural?: string };
  row?: FC<{
    data: T;
  }>;
  openModal?: () => void;
  addButtonText?: string;
  searchPlaceholder?: string;
}

export const ArtifactsTable = observer(
  <T extends { key: string }>({
    tableColumns,
    dataFetcher,
    filterFetcher,
    itemTypeDisplayName,
    artifactTableRow: ArtifactTableRow = DataTable.Row,
    openModal,
    addButtonText,
    searchPlaceholder,
  }: {
    tableColumns: Column<T>[];
    dataFetcher: (args) => Promise<AggregationResult<T>>;
    filterFetcher: ({ key }) => Promise<Filter[]>;
    artifactTableRow?: (data) => JSX.Element;
    itemTypeDisplayName: { singular: string; plural?: string };
    openModal?: () => void;
    addButtonText?: string;
    searchPlaceholder?: string;
  }) => {
    const {
      activeFilters: { searchTerm, ...filters },
    } = useFilters();
    const { artifactKey } = useParams<{ artifactKey: string }>();

    const filterOptions = filterFetcher ? useSuspense(filterFetcher, { key: artifactKey }) : [];

    const dataModel = useDataTable(dataFetcher, {
      columns: tableColumns,
      searchParams: { filters, key: artifactKey },
    });

    return (
      <ArtifactPlainTable
        dataModel={dataModel}
        filterOptions={filterOptions}
        itemTypeDisplayName={itemTypeDisplayName}
        row={rowProps => <ArtifactTableRow {...rowProps} />}
        openModal={openModal}
        addButtonText={addButtonText}
        searchPlaceholder={searchPlaceholder}
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

export const ArtifactPlainTable = observer(
  <
    T extends {
      key: string;
    },
    TMetadata = 0,
  >({
    dataModel,
    filterOptions,
    searchable = true,
    itemTypeDisplayName,
    row: Row = DataTable.Row,
    openModal,
    addButtonText,
    searchPlaceholder = 'Search',
  }: ArtifactsPlainTableProps<T, TMetadata>) => {
    return (
      <>
        <ArtifactsTableControls data-narrow={dataAttr(!filterOptions?.length)}>
          <SearchCounterWrraper>
            {searchable && <TableSearch placeholder={searchPlaceholder} />}
            <TableControls.Counter>
              <ResultsCounter
                count={dataModel.searchState.count}
                total={dataModel.searchState.total}
                itemName={itemTypeDisplayName.plural ?? `${itemTypeDisplayName.singular}s`}
              />
              {Boolean(openModal) && (
                <Tooltip content={addButtonText}>
                  <CircleButton variant={Variant.PRIMARY} size={Size.LARGE} onClick={openModal}>
                    <SvgIcon name="Plus" />
                  </CircleButton>
                </Tooltip>
              )}
            </TableControls.Counter>
          </SearchCounterWrraper>

          {Boolean(filterOptions?.length) && (
            <TableControls.Filters>
              <FiltersControls filterOptions={filterOptions} />
            </TableControls.Filters>
          )}
        </ArtifactsTableControls>

        <DataTable expandable dataModel={dataModel}>
          {(item: T) => <Row key={item.key} data={item} />}
        </DataTable>

        {!dataModel.ignorePagination && dataModel.searchState.items.length > 0 && (
          <TablePagination searchState={dataModel.searchState} />
        )}
      </>
    );
  }
);

const SearchCounterWrraper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5rem;
`;

const ArtifactsTableControls = styled(FluidTableControls)`
  margin: 0;

  ${TableControls.Actions} {
    margin-bottom: 5rem;
  }
`;
