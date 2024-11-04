import _ from 'lodash';
import { action, computed, makeObservable, observable } from 'mobx';
import { SearchState } from '@src-v2/models/search-state';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';
import { fromRem } from '@src-v2/utils/style-utils';

type DataTableColumn<TRow extends { key: string }> = Column<TRow> & {
  pinned?: boolean;
};

export type DataTableParams<TRow extends { key: string }, TMetadata = never> = {
  columns: Column<TRow>[];
  key?: string;
  searchState: SearchState<TRow, TMetadata>;
  pinned?: boolean;
  selectable?: boolean;
  isPinFeatureEnabled?: boolean;
  hasToggleColumns?: boolean;
  hasReorderColumns?: boolean;
  ignorePagination?: boolean;
  namespace?: string;
};

export class DataTable<TRow extends { key: string }, TMetadata = never> {
  columns: DataTableColumn<TRow>[];
  key: string;
  searchState: SearchState<TRow, TMetadata>;
  selection: TRow[] = [];
  expanded: TRow;
  ignorePagination?: boolean;
  pinned: boolean;
  isPinFeatureEnabled: boolean;
  selectable: boolean;
  hasReorderColumns: boolean;
  hasActionsMenu: boolean;
  hasToggleColumns: boolean;
  columnsWidth: { key: string; label?: any; width: number }[];
  namespace?: string;

  constructor({
    columns,
    key,
    searchState,
    pinned = false,
    selectable = false,
    isPinFeatureEnabled = true,
    hasToggleColumns = true,
    hasReorderColumns = true,
    ignorePagination = false,
    namespace = 'fl',
  }: DataTableParams<TRow, TMetadata>) {
    this.columns = columns.map(column => ({ ...column, key: column.key ?? _.uniqueId() }));
    this.key = key;
    this.namespace = namespace;
    this.expanded = null;
    this.pinned = pinned;
    this.selectable = selectable;
    this.searchState = searchState;
    this.isPinFeatureEnabled = isPinFeatureEnabled;
    this.hasReorderColumns = hasReorderColumns;
    this.hasToggleColumns = hasToggleColumns;
    this.hasActionsMenu = Boolean(this.columns.find(column => column.key === 'actions-menu'));
    this.ignorePagination = ignorePagination;
    this.columnsWidth = [
      { key: 'selectable', width: this.selectable ? 64 : 0 },
      ...this.columns.map(column => {
        if (column?.width) {
          // if width is string, convert rem to number, multiply by 4 to make pixels, add 16 padding
          return {
            key: column.key,
            width:
              typeof column.width === 'string'
                ? (fromRem(column.width, false) as number)
                : column.width ?? 80,
          };
        }
        return { key: column.key, width: 80 };
      }),
    ];

    makeObservable(this, {
      key: observable,
      columns: observable,
      selection: observable,
      expanded: observable,
      pinned: observable,
      selectable: observable,
      columnsWidth: observable,
      hasActionsMenu: observable,
      hasToggleColumns: observable,
      hasReorderColumns: observable,
      isAllSelected: computed,
      addSelection: action,
      setExpandedItem: action,
      setColumnsWidth: action,
      setIsPinned: action,
      removeSelection: action,
      toggleSelectAll: action.bound,
      clearSelection: action,
      togglePinColumn: action,
      toggleColumnView: action,
      toggleNestedColumnView: action,
      hideAllNestedColumns: action,
      moveColumn: action,
    });
  }

  get isAllSelected() {
    return this.searchState.items.every(item => this.isItemSelected(item));
  }

  isItemSelected(item: TRow) {
    return this.selection.some(selected => selected.key === item.key);
  }

  isItemExpanded(item: TRow) {
    return this.expanded?.key === item.key;
  }

  addSelection(item: TRow) {
    this.selection.push(item);
  }

  setExpandedItem(item: TRow) {
    this.expanded = item;
  }

  setColumnsWidth(items: DataTable<TRow, TMetadata>['columnsWidth']) {
    this.columnsWidth = items;
    this.updateTableView();
  }

  setIsPinned(value: boolean) {
    const hasPinnedColumns = Boolean(this.columns.find(column => column.pinned));
    if (!hasPinnedColumns) {
      this.pinned = false;
    }
    this.pinned = value;
  }

  removeSelection(item: TRow) {
    this.selection = this.selection.filter(selected => selected.key !== item.key);
  }

  toggleSelectAll() {
    if (this.isAllSelected) {
      this.selection = [];
    } else {
      for (const result of this.searchState.items) {
        !this.isItemSelected(result) && this.addSelection(result);
      }
    }
  }

  clearSelection() {
    this.selection = [];
  }

  updateTableView() {
    if (!this.key) {
      return;
    }
    const config = this.columns.map(({ Cell, nestedColumns, resizeable, label, ...column }) => ({
      ...column,
      nestedColumns: nestedColumns
        ? nestedColumns.map(({ Cell, label, ...nested }) => ({
            ...nested,
            hidden: column.hidden ? column.hidden : nested.hidden,
          }))
        : null,
      width: column.hidden
        ? 80 // 80 as default width size
        : Math.round(
            parseFloat(this.columnsWidth.find(({ key }) => column.key === key)?.width?.toString())
          ),
    }));
    localStorage.setItem(this.key, JSON.stringify(config));
  }

  moveColumn({ dragIndex, hoverIndex }: StubAny) {
    // filter hidden columns
    const shownColumns = this.columns.filter(column => !column.hidden);
    const hiddenColumns = this.columns.filter(column => Boolean(column.hidden));
    const dragColumn = this.columns[dragIndex];
    const filteredColumns = shownColumns.filter(column => column.key !== dragColumn.key);

    // insert the dragged column to the new position and hidden at the end
    this.columns = [
      ...filteredColumns.slice(0, hoverIndex),
      dragColumn,
      ...filteredColumns.slice(hoverIndex),
      ...hiddenColumns,
    ];

    const widthColumns = [
      this.columnsWidth[0],
      ...this.columns?.map(column => ({
        key: column.key,
        width: this.columnsWidth.find(columnWidth => column.key === columnWidth.key).width,
      })),
    ];
    this.setColumnsWidth(widthColumns);
  }

  togglePinColumn({ index, isRemoved }: StubAny) {
    const lastIndex = this.columns.map(column => column.pinned).lastIndexOf(true);
    if (this.columns[index].pinned) {
      this.columns[index].pinned = false;
      const hoverIndex = isRemoved ? this.columns.length - 1 : lastIndex >= 0 ? lastIndex : 0;
      this.moveColumn({ dragIndex: index, hoverIndex });
    } else {
      this.columns[index].pinned = true;
      this.moveColumn({ dragIndex: index, hoverIndex: lastIndex + 1 });
    }
    this.updateTableView();
  }

  toggleColumnView({ key }: StubAny) {
    const index = this.columns.findIndex(column => column.key === key);
    const shouldToggleHidden = index >= 0;
    if (shouldToggleHidden) {
      if (this.columns[index].pinned) {
        this.togglePinColumn({ index, isRemoved: true });
        const newColumnIndex = this.columns.findIndex(column => column.key === key);
        this.columns[newColumnIndex].hidden = true;
      } else if (this.columns[index].hidden) {
        const hasActionsMenuCell = Boolean(
          this.columns.find(column => column.key === 'actions-menu')
        );
        const lastHiddenIndex = _.findLastIndex(this.columns, ({ hidden }) => !hidden);
        this.columns[index].hidden = false;
        this.moveColumn({
          dragIndex: index,
          hoverIndex:
            lastHiddenIndex >= 0 ? (hasActionsMenuCell ? lastHiddenIndex : lastHiddenIndex + 1) : 0,
        });
      } else {
        this.moveColumn({
          dragIndex: index,
          hoverIndex: this.columns.filter(column => !column.hidden).length - 1,
        });
        const newColumnIndex = this.columns.findIndex(column => column.key === key);
        this.columns[newColumnIndex].hidden = true;
      }
    }
    this.updateTableView();
  }

  toggleNestedColumnView({ key, parentKey }: StubAny) {
    const parentIndex = this.columns.findIndex(column => column.key === parentKey);
    const index = this.columns[parentIndex].nestedColumns.findIndex(column => column.key === key);
    const updatedNested = [...this.columns[parentIndex].nestedColumns];

    // check if all were hidden before adding, if so we toggle the parent column
    const prevShown = updatedNested.filter(column => !column.hidden);
    updatedNested[index].hidden = !updatedNested[index].hidden;

    // reorder so hidden columns at the end
    const shown = updatedNested.filter(column => !column.hidden);
    const hidden = updatedNested.filter(column => column.hidden);

    this.columns[parentIndex].nestedColumns = [...shown, ...hidden];

    // toggle column if no more nested columns or there were none and now there is at least 1
    if (shown.length === 0 || prevShown.length === 0) {
      this.toggleColumnView({ key: this.columns[parentIndex].key });
    }
    this.updateTableView();
  }

  hideAllNestedColumns({ key }: StubAny) {
    const index = this.columns.findIndex(column => column.key === key);
    if (index) {
      this.columns[index].nestedColumns?.forEach(column => (column.hidden = true));
    }
  }
}

export const loadTableSavedView = <TRow extends { key: string }>({
  key,
  tableColumns,
}: {
  key: string;
  tableColumns: Column<TRow>[];
}) => {
  if (!key) {
    return tableColumns;
  }

  try {
    const tableViewState = JSON.parse(window.localStorage.getItem(key)) ?? [];

    // this checks if columns were added or removed from table
    const tableKeys = tableColumns.map(column => column.key);
    const tableViewStateKeys = tableViewState.map((column: StubAny) => column.key);

    // filter removed columns
    const filteredTableView = tableViewState.filter((column: StubAny) =>
      tableKeys.includes(column.key)
    );

    // filter new columns added and add them before the hidden columns
    const newColumnsAdded = tableColumns
      .filter(column => !tableViewStateKeys.includes(column.key))
      .map(column => ({ ...column, hidden: tableViewState.length === 0 ? column.hidden : false }));

    const firstHiddenIndex = filteredTableView.findIndex(
      (item: StubAny) => item.hidden || item.key === 'actions-menu'
    );

    return [
      ...filteredTableView.slice(0, firstHiddenIndex),
      ...newColumnsAdded,
      ...filteredTableView.slice(firstHiddenIndex),
    ].map(column => {
      const matchingColumn = tableColumns.find(({ key }) => column.key === key);
      const nestedColumns = matchingColumn.nestedColumns?.map(nested => ({
        ...nested,
        ...(column.nestedColumns?.find((item: StubAny) => item.key === nested.key) ?? {}),
      }));

      return {
        ...matchingColumn,
        ...column,
        width:
          matchingColumn.resizeable === false
            ? matchingColumn.minWidth ?? matchingColumn.width
            : column.width,
        label: matchingColumn.label,
        Cell: matchingColumn.Cell,
        draggable: matchingColumn.draggable,
        resizeable: matchingColumn.resizeable,
        nestedColumns,
      };
    });
  } catch (error) {
    return tableColumns;
  }
};
