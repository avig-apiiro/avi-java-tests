import { observer } from 'mobx-react';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { BaseIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import {
  TableConditionalActions,
  TableCounter,
  TableSearch,
} from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { Filter } from '@src-v2/hooks/use-filters';
import { DataTable as DataTableModel } from '@src-v2/models/data-table';
import { modify } from '@src-v2/utils/mobx-utils';

export const ConnectionsTable = observer(
  <
    T extends {
      key: string;
    },
    TMetadata = 0,
  >({
    dataModel,
    filterGroups,
    searchItem,
    conditionalActions,
    ...props
  }: {
    children: (row: any) => ReactNode;
    dataModel: DataTableModel<T, TMetadata>;
    filterGroups: Filter[];
    searchItem: { singular: string; plural: string };
    conditionalActions?: any;
  }) => {
    return (
      <>
        <FluidTableControls style={filterGroups.length === 0 ? { marginBottom: 0 } : {}}>
          {!dataModel.key?.includes('broker-table') && (
            <TableSearch placeholder={`Search by ${searchItem.singular} name`} />
          )}
          {Boolean(filterGroups.length) && (
            <TableControls.Filters>
              <FiltersControls filterOptions={filterGroups} />
            </TableControls.Filters>
          )}
          <TableControls.Counter>
            <TableCounter
              dataModel={dataModel}
              itemName={
                dataModel.searchState.items.length === 1 ? searchItem.singular : searchItem.plural
              }
            />
          </TableControls.Counter>
        </FluidTableControls>
        {conditionalActions && (
          <TableConditionalActions shouldDisplay={dataModel.selection.length > 0}>
            {conditionalActions}
          </TableConditionalActions>
        )}
        <DataTable {...props} dataModel={dataModel} />

        {dataModel.searchState.items.length > 0 && (
          <TablePagination searchState={dataModel.searchState} />
        )}
      </>
    );
  }
);

export const bulkMonitorToggle = ({ asyncHandler, dataModel, toaster }) => {
  const shouldMonitor = !dataModel.selection.every(repository => repository.isMonitored);
  modify(dataModel.searchState, { loading: true });

  asyncHandler(dataModel.selection, shouldMonitor)
    .catch(() => {
      toaster.error('Failed to change monitor status, please try again');
    })
    .finally(() => modify(dataModel.searchState, { loading: false }));
};

export const SuggestionsCell = styled(Table.FlexCell)`
  justify-content: center;

  ${BaseIcon} {
    &[data-name='Info'] {
      color: var(--color-red-50);
    }

    &[data-name='Star'] {
      color: var(--color-blue-gray-50);
      fill: var(--color-yellow-30);
    }
  }
`;
