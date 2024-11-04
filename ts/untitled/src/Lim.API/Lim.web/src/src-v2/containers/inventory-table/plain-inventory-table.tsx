import { observer } from 'mobx-react';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { DataTable as _DataTable } from '@src-v2/containers/data-table/data-table';
import {
  SelectedCount,
  TableCounter,
  TableSearch,
} from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { Filter } from '@src-v2/hooks/use-filters';
import { DataTable as DataTableModel } from '@src-v2/models/data-table';
import { dataAttr } from '@src-v2/utils/dom-utils';

interface PlainInventoryTableProps<
  T extends {
    key: string;
  },
  TMetadata,
> {
  dataModel: DataTableModel<T, TMetadata>;
  showSearch?: boolean;
  searchPlaceholder?: string;
  filterOptions?: Filter[];
  row?: FC<{
    data: T;
  }>;
  actions?: ReactNode;
}

const DataTable = styled(_DataTable)`
  ${Table.Body} ${Table.Row} {
    height: 14rem;
  }

  ${Table.Cell}:last-child {
    padding-right: 2rem;
  }
`;

export const PlainInventoryTable = observer(
  <
    T extends {
      key: string;
    },
    TMetadata = 0,
  >({
    dataModel,
    showSearch = true,
    searchPlaceholder = 'Search',
    filterOptions,
    row: Row = DataTable.Row,
    actions,
  }: PlainInventoryTableProps<T, TMetadata>) => {
    const hasFilters = Boolean(filterOptions?.length);
    return (
      <>
        <InventoryTableControls data-narrow={dataAttr(!hasFilters)}>
          {showSearch && <TableSearch placeholder={searchPlaceholder} />}
          <TableControls.Actions>
            {!hasFilters && <TableCounter dataModel={dataModel} />}
            {actions}
          </TableControls.Actions>
          {hasFilters && (
            <>
              <TableControls.Filters>
                <FiltersControls filterOptions={filterOptions} />
              </TableControls.Filters>
              <TableControls.Counter>
                <TableCounter dataModel={dataModel} />
              </TableControls.Counter>
            </>
          )}
        </InventoryTableControls>

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

export const InventoryTableControls = styled(FluidTableControls)`
  &[data-narrow] {
    grid-template-areas: 'search actions';

    ${TableControls.Actions} ${SelectedCount} {
      padding: 0;
      margin: auto;
    }
  }
`;
