import _ from 'lodash';
import { observer } from 'mobx-react';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Checkbox } from '@src-v2/components/forms';
import { ErrorLayout } from '@src-v2/components/layout';
import { ScrollToTop } from '@src-v2/components/scroll-to-top';
import { Table } from '@src-v2/components/table/table';
import { TableNotice } from '@src-v2/components/table/table-addons';
import { DataTableHeader } from '@src-v2/containers/data-table/data-table-header';
import { usePinnedStyle, useTableScrolling } from '@src-v2/containers/data-table/utils/hooks';
import { DataTable as DataTableModel } from '@src-v2/models/data-table';
import { customScrollbar } from '@src-v2/style/mixins';
import { assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

type DataTableProps<TRow extends { key: string }, TMetadata = never> = {
  dataModel: DataTableModel<TRow, TMetadata>;
  emptyMessage?: string;
  expandable?: boolean;
  children?: ReactNode | ((item: TRow) => ReactNode);
};

const _DataTable = observer(
  <TRow extends { key: string }, TMetadata = never>({
    dataModel,
    emptyMessage = 'No results found',
    expandable = false,
    children,
    ...props
  }: DataTableProps<TRow, TMetadata>) => {
    const { searchState } = dataModel;

    const { scrollContainerRef, scrolledPosition, handleScrollPositionChange } = useTableScrolling({
      dataModel,
    });

    const emptyColSpan = useMemo(() => {
      let finalLength = dataModel.selectable
        ? dataModel.columns?.length + 1
        : dataModel.columns?.length;
      if (!dataModel.hasActionsMenu && dataModel.hasToggleColumns) {
        finalLength += 1;
      }

      const shownNestedCount =
        dataModel.columns
          ?.flatMap(column => column.nestedColumns ?? [])
          ?.filter(nestedColumn => !nestedColumn.hidden)?.length ?? 0;

      return finalLength + shownNestedCount;
    }, [dataModel]);

    const { Provider: ContextProvider } = getDataModelContext<TRow, TMetadata>();

    return (
      <ContextProvider
        value={{
          dataModel,
          expandable,
        }}>
        <BoxContainer
          data-test-marker="table-container"
          data-empty={dataAttr(dataModel.searchState?.items?.length === 0)}>
          <ScrollContainer
            {...props}
            ref={scrollContainerRef}
            height={70}
            roundBorder={dataModel.isPinFeatureEnabled}
            onScroll={handleScrollPositionChange}>
            <Table
              data-disabled={dataAttr(searchState.loading)}
              data-scrolled={scrolledPosition}
              data-pinned={dataAttr(dataModel.isPinFeatureEnabled)}>
              <DataTableHeader />
              <Table.Body>
                {searchState.items.length ? (
                  typeof children === 'function' ? (
                    searchState.items.map(item => children(item))
                  ) : (
                    children
                  )
                ) : (
                  <TableNotice colSpan={emptyColSpan}>
                    {searchState.loading ? '' : <ErrorLayout.NoResults data-contained />}
                  </TableNotice>
                )}
              </Table.Body>
            </Table>
          </ScrollContainer>
          {searchState.loading && <LogoSpinner />}
          <ScrollToTop />
        </BoxContainer>
      </ContextProvider>
    );
  }
);

const Row = observer(({ data, ...props }) => {
  const { dataModel, expandable } = useDataTableContext();
  const noPinnedColumns = useMemo(
    () => !dataModel.columns.find(column => Boolean(column.pinned)),
    [dataModel.columns]
  );

  return (
    <Table.Row
      {...props}
      data-selected={dataAttr(dataModel.selectable && dataModel.isItemSelected(data))}
      data-expanded={dataAttr(expandable && dataModel.isItemExpanded(data))}
      data-test-marker="table-row">
      {dataModel.selectable && (
        <Table.Cell
          data-test-marker="table-cell-checkbox"
          data-selection-column
          data-pinned-column={dataAttr(
            dataModel.isPinFeatureEnabled,
            noPinnedColumns ? 'last' : ''
          )}>
          <Checkbox
            checked={dataModel.isItemSelected(data)}
            onClick={stopPropagation}
            onChange={event =>
              event.target.checked ? dataModel.addSelection(data) : dataModel.removeSelection(data)
            }
          />
        </Table.Cell>
      )}
      {dataModel.columns
        ?.filter(column => !column.hidden)
        ?.map(
          ({ Cell, ...column }, index) =>
            column.nestedColumns
              ?.filter(item => !item?.hidden)
              .map(({ Cell, ...nested }) => (
                <TableColumn
                  key={nested.key}
                  cell={Cell}
                  column={nested}
                  data={data}
                  index={index}
                />
              )) ?? (
              <TableColumn key={column.key} cell={Cell} column={column} data={data} index={index} />
            )
        )}
      {!dataModel.hasActionsMenu && dataModel.hasToggleColumns && (
        <Table.CenterCell
          data-action-menu
          data-pinned-column={dataAttr(dataModel.isPinFeatureEnabled && dataModel.pinned)}
        />
      )}
    </Table.Row>
  );
});

const TableColumn = ({ cell: Cell, column, data, index }) => {
  const { left, pinnedColumnDataAttr } = usePinnedStyle({ index, pinned: column.pinned });

  return (
    <Cell
      key={column.key}
      style={{ left }}
      data-pinned-column={pinnedColumnDataAttr}
      data={data}
      data-test-marker="table-cell"
    />
  );
};

// BoxContainer: makes the table stay in place when resizing
const BoxContainer = styled.div`
  width: calc(100% + var(--scrollbar-width));
  display: grid;
  position: relative;

  &[data-empty] {
    width: 100%;
  }

  > ${LogoSpinner} {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
  }
`;

const ScrollContainer = styled.div<{ roundBorder?: boolean; height: string | number }>`
  ${customScrollbar};
  max-height: calc(100vh - ${props => props.height}rem);
  position: relative;
  border-radius: ${props => (props.roundBorder ? '3rem' : '0')};
  overflow-x: auto;

  ${Table.Row} ${LogoSpinner} {
    width: 6rem;
    height: 6rem;
  }
`;

const getDataModelContext = _.once(<TRow extends { key: string }, TMetadata>() =>
  createContext<{
    dataModel: DataTableModel<TRow, TMetadata>;
    expandable: boolean;
  }>(null)
);

export function useDataTableContext<TRow extends { key: string }, TMetadata = never>() {
  return useContext(getDataModelContext<TRow, TMetadata>());
}

export const DataTable = assignStyledNodes(_DataTable, { Row, BoxContainer });
