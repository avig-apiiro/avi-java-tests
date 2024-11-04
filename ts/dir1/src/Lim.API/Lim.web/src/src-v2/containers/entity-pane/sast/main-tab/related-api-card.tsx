import { useMemo } from 'react';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { PlainPaneTable } from '@src-v2/components/panes/plain-pane-table';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import {
  EndpointCell,
  HttpMethod,
} from '@src-v2/components/table/table-common-cells/endpoint-cell';
import { InsightsCell } from '@src-v2/components/table/table-common-cells/insights-cell';
import { useSastPaneContext } from '@src-v2/containers/entity-pane/sast/use-sast-pane-context';
import { useInject } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useTable } from '@src-v2/hooks/use-table';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RelatedEntity } from '@src-v2/types/inventory-elements/code-findings';
import { pluralFormat } from '@src-v2/utils/number-utils';

export function RelatedApiCard(props: ControlledCardProps) {
  const { element } = useSastPaneContext();
  const { application } = useInject();
  const isSmartTableOnRiskPaneEnabled = application.isFeatureEnabled(
    FeatureFlag.SmartTableOnRiskPane
  );
  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  const dataModelsWithKey = useMemo(
    () =>
      element.relatedEntities.map((data, index) => ({
        key: `${element.entityId}-${index}`,
        ...data,
      })),
    [element.relatedEntities]
  );

  const clientTableModel = useClientDataTable<RelatedEntity & { key: string }>(dataModelsWithKey, {
    key: 'relatedEntities',
    columns: tableColumns,
  });

  return (
    <ControlledCard {...props} title="Related APIs">
      {isSmartTableOnRiskPaneEnabled ? (
        <PlainPaneTable
          dataModel={clientTableModel}
          itemName={pluralFormat(dataModelsWithKey.length, 'related Api', 'related Api')}
        />
      ) : (
        <CollapsibleTable<RelatedEntity> tableModel={tableModel} items={element.relatedEntities} />
      )}
    </ControlledCard>
  );
}

const tableColumns = [
  {
    key: 'related-api-name-column',
    label: 'Name',
    Cell: ({ data, ...props }: { data: RelatedEntity }) => (
      <EndpointCell
        {...props}
        relativeFilePath={data?.codeReference?.relativeFilePath}
        httpMethod={data?.relatedEntitySummaryInfo?.httpMethod || HttpMethod.ANY}
        httpRoute={data?.relatedEntitySummaryInfo?.httpRoute}
      />
    ),
  },
  {
    key: 'related-api-insights-column',
    label: 'Insights',
    Cell: ({ data, ...props }: { data: RelatedEntity }) => (
      <InsightsCell {...props} insights={data.relatedEntitySummaryInfo.insights} />
    ),
  },
];
