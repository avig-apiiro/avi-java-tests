import { TextButton } from '@src-v2/components/button-v2';
import { ClampText } from '@src-v2/components/clamp-text';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { Counter } from '@src-v2/components/counter';
import { SvgIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { useOpenDataModelReferencePane } from '@src-v2/containers/entity-pane/use-open-data-model-reference-pane';
import { ArtifactExplorerTableView } from '@src-v2/containers/pages/artifacts/artifacts-view-explorer-table';
import { ConsumableProfileView } from '@src-v2/containers/profiles/consumable-profiles-view';
import { RiskInsightsCell } from '@src-v2/containers/risks/risks-common-cells';
import {
  ApiiroQlQueryResultColumn,
  ApiiroQlQueryResultColumnType,
  apiiroQlResultColumnTypeDataHandlers,
} from '@src-v2/services';

const COLUMN_TITLE_WIDTH_PADDING = 10;
const COLUMN_TITLE_WIDTH_PER_CHAR = 3;

export function CommonInventoryQueryResultCells(projectionColumns: ApiiroQlQueryResultColumn[]) {
  return createProjectionResultTableColumns(projectionColumns);
}

const projectionColumnTypesToColumnTypeDescriptor: {
  [columnTypeName in ApiiroQlQueryResultColumnType]: (
    columnDef: ApiiroQlQueryResultColumn,
    columnIndex: number
  ) => any;
} = {
  ApiiroQlQueryResultFieldString: () => ({
    width: '40rem',
    resizeable: true,
    cellConstructor: InventoryStringCell,
  }),
  ApiiroQlQueryResultFieldNumber: () => ({
    width: '40rem',
    resizeable: true,
    cellConstructor: InventoryStringCell,
  }),
  ApiiroQlQueryResultFieldBoolean: () => ({
    width: '40rem',
    resizeable: false,
    cellConstructor: InventoryBooleanCell,
  }),
  ApiiroQlQueryResultFieldInsights: () => ({
    width: '50rem',
    resizeable: true,
    cellConstructor: InventoryInsightsCell,
  }),
  ApiiroQlQueryResultFieldRiskTriggerInsights: () => ({
    width: '50rem',
    resizeable: true,
    cellConstructor: InventoryInsightsCell,
  }),
  ApiiroQlQueryResultFieldDataModelObject: () => ({
    width: '50rem',
    resizeable: true,
    cellConstructor: InventoryObjectCell,
  }),
  ApiiroQlQueryResultFieldStringList: () => ({
    width: '50rem',
    resizeable: true,
    cellConstructor: InventoryStringListCell,
  }),
  ApiiroQlQueryResultFieldConsumableProfile: () => ({
    width: '50rem',
    resizeable: true,
    cellConstructor: InventoryRepositoryCell,
  }),
  ApiiroQlQueryResultFieldMultiSourcedEntity: () => ({
    width: '50rem',
    resizeable: true,
    cellConstructor: InventoryArtifactCell,
  }),
  ApiiroQlQueryResultFieldCodeReference: () => ({
    width: '50rem',
    resizeable: true,
    cellConstructor: InventoryCodeReferenceCell,
  }),
};

function InventoryStringCell({ data, ...props }) {
  return (
    <Table.Cell {...props}>
      <ClampText elementSizeBoundToContent={false}>{String(data.value)}</ClampText>
    </Table.Cell>
  );
}

function InventoryStringListCell({ data, ...props }) {
  return (
    <Table.FlexCell {...props}>
      {data.values?.length > 0 ? (
        <ClampText elementSizeBoundToContent={false}>{String(data.values[0])}</ClampText>
      ) : null}
      {data.values?.length > 1 && (
        <Tooltip content={data.values?.slice(1).map(value => <p key={value}>{value}</p>)}>
          <Counter>+{data.values?.length - 1}</Counter>
        </Tooltip>
      )}
    </Table.FlexCell>
  );
}

function InventoryBooleanCell({ data, ...props }) {
  return (
    <Table.CenterCell {...props}>
      {data.value ? <SvgIcon name="Success" /> : <SvgIcon name="CloseRoundedOutline" />}
    </Table.CenterCell>
  );
}

function InventoryInsightsCell(props) {
  return <RiskInsightsCell disableFilter {...props} />;
}

function InventoryObjectCell({ data, ...props }) {
  const openPane = useOpenDataModelReferencePane();

  return (
    <Table.Cell {...props}>
      <TextButton
        onClick={event => {
          openPane(data.reference);
          event.preventDefault();
          event.stopPropagation();
        }}>
        {data.description}
      </TextButton>
    </Table.Cell>
  );
}

function InventoryRepositoryCell({ data, ...props }) {
  return (
    <Table.Cell {...props}>
      {data.leanConsumableProfile ? (
        <ConsumableProfileView profile={data.leanConsumableProfile} />
      ) : null}
    </Table.Cell>
  );
}

function InventoryArtifactCell({ data, ...props }) {
  return (
    <Table.Cell {...props}>
      <ArtifactExplorerTableView artifactMultiSourcedEntity={data.multiSourcedEntity} />
    </Table.Cell>
  );
}

function InventoryCodeReferenceCell({ data }) {
  return (
    <Table.Cell>{data && data.url && <CodeReferenceLink url={data.url} {...data} />}</Table.Cell>
  );
}

function BindCellToField(cellType, columnIndex: number) {
  return props => {
    const data = props.data.fields[columnIndex];
    return data ? cellType({ ...props, data }) : <Table.Cell {...props}>&nbsp;</Table.Cell>;
  };
}

function suggestWidthForColumnTitle(title: string): number {
  return title.length * COLUMN_TITLE_WIDTH_PER_CHAR + COLUMN_TITLE_WIDTH_PADDING;
}

function createProjectionResultTableColumns(projectionColumns: ApiiroQlQueryResultColumn[]) {
  if (!projectionColumns) {
    return [];
  }

  return projectionColumns.map((projectionColumn, columnIndex) => {
    const columnGenerator = projectionColumnTypesToColumnTypeDescriptor[projectionColumn.type];

    const { cellConstructor, ...columnOptions } = columnGenerator
      ? columnGenerator(projectionColumn, columnIndex)
      : { cellConstructor: () => <Table.Cell>&nbsp;</Table.Cell> };

    const widthInRem: number = parseFloat(columnOptions.width ?? '40');
    columnOptions.width = `${Math.max(
      widthInRem,
      suggestWidthForColumnTitle(projectionColumn.title)
    )}rem`;
    return {
      key: `property-${projectionColumn.key}`,
      fieldName: projectionColumn.key,
      label: projectionColumn.title,
      resizeable: false,
      sortable: Boolean(
        apiiroQlResultColumnTypeDataHandlers[projectionColumn.type]?.sortComparator
      ),
      Cell: BindCellToField(cellConstructor, columnIndex),
      ...columnOptions,
    };
  });
}
