import { useMemo } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { Clamp, ClampText } from '@src-v2/components/clamp-text';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { QuickFilters } from '@src-v2/components/filters/quick-filters';
import { PlainPaneTable } from '@src-v2/components/panes/plain-pane-table';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Table } from '@src-v2/components/table/table';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Paragraph } from '@src-v2/components/typography';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { useInject, useToggle } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useTable } from '@src-v2/hooks/use-table';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RelatedDataModelInfo } from '@src-v2/types/inventory-elements/api/api-element-response';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { pluralFormat } from '@src-v2/utils/number-utils';

export function DataModelsCard(props: ControlledCardProps) {
  const { element } = useApiPaneContext();
  const { application } = useInject();
  const isSmartTableOnRiskPaneEnabled = application.isFeatureEnabled(
    FeatureFlag.SmartTableOnRiskPane
  );
  const [showExposedData, toggleShowExposedData] = useToggle(
    Boolean(element.exposedDataModels?.length)
  );

  const dataModels = showExposedData ? element.exposedDataModels : element.involvedDataModels;

  const tableModel = useTable({ tableColumns, hasReorderColumns: false });

  const dataModelsWithKey = useMemo(
    () =>
      dataModels.map((data, index) => ({
        key: `${element.entityId}-${index}`,
        ...data,
      })),
    [dataModels]
  );

  const clientTableModel = useClientDataTable<RelatedDataModelInfo & { key: string }>(
    dataModelsWithKey,
    {
      key: 'dataModels',
      columns: tableColumns,
    }
  );

  return (
    <ControlledCard
      {...props}
      title={`Related data models (${
        element.involvedDataModels?.length + element.exposedDataModels?.length
      })`}>
      <Paragraph>
        This API either directly exposes or indirectly involves the following data models with
        sensitive data:
      </Paragraph>
      <QuickFilters>
        <Button
          variant={Variant.FILTER}
          disabled={!element.exposedDataModels?.length}
          data-active={dataAttr(showExposedData)}
          onClick={() => toggleShowExposedData(true)}>
          Exposes sensitive data &middot; {element.exposedDataModels?.length}
        </Button>
        <Button
          variant={Variant.FILTER}
          disabled={!element.involvedDataModels?.length}
          data-active={dataAttr(!showExposedData)}
          onClick={() => toggleShowExposedData(false)}>
          Involves sensitive data &middot; {element.involvedDataModels?.length}
        </Button>
      </QuickFilters>
      {isSmartTableOnRiskPaneEnabled ? (
        <PlainPaneTable
          dataModel={clientTableModel}
          itemName={pluralFormat(dataModelsWithKey.length, 'data model', 'data models')}
        />
      ) : (
        <CollapsibleTable compactRowsNumber={5} tableModel={tableModel} items={dataModels} />
      )}
    </ControlledCard>
  );
}

const ModuleCell = styled(({ data, ...props }: StyledProps<{ data: RelatedDataModelInfo }>) => (
  // @ts-ignore
  <Table.Cell {...props}>
    <CodeReferenceLink
      lines={3}
      codeReference={data.codeReference}
      repository={useApiPaneContext().relatedProfile}
    />
  </Table.Cell>
))`
  ${Clamp} {
    max-height: 14rem;
    white-space: unset;
    word-break: break-word;
  }
`;

const tableColumns = [
  {
    key: 'related-data-module-column',
    label: 'Module',
    Cell: ModuleCell,
  },
  {
    key: 'related-data-model-column',
    label: 'Data model',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText>{data.codeReference.name}</ClampText>
      </Table.Cell>
    ),
    width: '45rem',
  },
  {
    key: 'related-data-sensitive-data-column',
    label: 'Sensitive data field',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText>{data.dataFieldName}</ClampText>
      </Table.Cell>
    ),
    width: '50rem',
  },
  {
    key: 'related-data-type-data-column',
    label: 'Type',
    Cell: ({ data, ...props }) => <Table.Cell {...props}>{data.types?.join(', ')}</Table.Cell>,
    width: '45rem',
  },
];
