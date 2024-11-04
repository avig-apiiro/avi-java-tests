import { useMemo } from 'react';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ClampText } from '@src-v2/components/clamp-text';
import { ConditionalProviderIcon } from '@src-v2/components/icons';
import { PlainPaneTable } from '@src-v2/components/panes/plain-pane-table';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Table } from '@src-v2/components/table/table';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ExternalLink } from '@src-v2/components/typography';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { useInject } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useTable } from '@src-v2/hooks/use-table';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RelatedEndpoint } from '@src-v2/types/inventory-elements/api/api-element';
import { Column } from '@src-v2/types/table';
import { pluralFormat } from '@src-v2/utils/number-utils';

export function MatchedEndpointsCard(props: ControlledCardProps) {
  const { element } = useApiPaneContext();
  const { application } = useInject();

  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  const isSmartTableOnRiskPaneEnabled = application.isFeatureEnabled(
    FeatureFlag.SmartTableOnRiskPane
  );

  const dataModelsWithKey = useMemo(
    () =>
      element?.relatedEndpoints.map((data, index) => ({
        key: `${element.entityId}-${index}`,
        ...data,
      })),
    [element?.relatedEndpoints]
  );

  const clientTableModel = useClientDataTable<RelatedEndpoint & { key: string }>(
    dataModelsWithKey,
    {
      key: 'matchedEndpoint',
      columns: tableColumns,
    }
  );

  return (
    <ControlledCard {...props} title={`Matched endpoints (${element?.relatedEndpoints.length})`}>
      {isSmartTableOnRiskPaneEnabled ? (
        <PlainPaneTable
          dataModel={clientTableModel}
          itemName={pluralFormat(dataModelsWithKey.length, 'matched end point')}
        />
      ) : (
        <CollapsibleTable<RelatedEndpoint>
          tableModel={tableModel}
          items={element?.relatedEndpoints}
        />
      )}
    </ControlledCard>
  );
}

const tableColumns: Column<RelatedEndpoint>[] = [
  {
    key: 'matched-endpoints-name-column',
    label: 'Name',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <ExternalLink href={data.externalUrl}>
          <ClampText lines={3}>{`${data.method} ${data.route}`}</ClampText>
        </ExternalLink>
      </Table.FlexCell>
    ),
  },
  {
    key: 'matched-endpoints-service-column',
    label: 'Service / Host',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        {data.serviceName ? (
          <ExternalLink href={data.serviceExternalUrl}>{data.serviceName}</ExternalLink>
        ) : (
          <ExternalLink href={data.hostName}>{data.hostName}</ExternalLink>
        )}
      </Table.FlexCell>
    ),
  },
  {
    key: 'matched-endpoints-source-column',
    label: 'Source',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <Tooltip content={getProviderDisplayName(data.provider)}>
          <ConditionalProviderIcon name={data.provider} />
        </Tooltip>
      </Table.FlexCell>
    ),
  },
];
