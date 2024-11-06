import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { BaseIcon, ConditionalProviderIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { EndpointCell } from '@src-v2/components/table/table-common-cells/endpoint-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ExternalLink } from '@src-v2/components/typography';
import { InventoryInsightsCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/inventory-insights-cell';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ApiElement, RelatedEndpoint } from '@src-v2/types/inventory-elements/api/api-element';
import { stopPropagation } from '@src-v2/utils/dom-utils';

const EndpointDisplay = styled(({ value, ...props }: { value: RelatedEndpoint }) => (
  <div {...props} onClick={stopPropagation}>
    {value.serviceName && (
      <ServiceNameLink href={value.serviceExternalUrl}>
        <ClampText>{value.serviceName}</ClampText>
      </ServiceNameLink>
    )}
    <EndpointLink href={value.externalUrl}>
      <ClampText>{`${value.method} ${value.route}`}</ClampText>
    </EndpointLink>
  </div>
))`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  gap: 2rem;

  ${ExternalLink} {
    overflow: hidden;
  }
`;

const ServiceNameLink = styled(ExternalLink)`
  max-width: 20rem;
  font-weight: 300;
`;

const EndpointLink = styled(ExternalLink)`
  flex: 1;
`;

const ApiSourceCell = styled(({ data, ...props }: { data: ApiElement }) => (
  <Table.Cell {...props}>
    <IconsContainer>
      {data.diffableEntity?.relatedEndpointSources?.map(provider => {
        return (
          <Tooltip key={provider} content={getProviderDisplayName(provider)}>
            <ConditionalProviderIcon name={provider} />
          </Tooltip>
        );
      })}
    </IconsContainer>
  </Table.Cell>
))`
  max-width: fit-content;
  white-space: nowrap;
`;

const ApiEndpointCell = styled(({ data, ...props }: { data: ApiElement }) => (
  <TrimmedCollectionCell
    {...props}
    tooltip={CustomTooltip}
    limitExcessiveItems={10}
    item={EndpointDisplay}>
    {data.diffableEntity?.relatedEndpoints}
  </TrimmedCollectionCell>
))`
  max-width: fit-content;
  white-space: nowrap;
`;

export const apiElementColumns = [
  {
    key: 'name-column',
    label: 'Name',
    width: '125rem',
    Cell: ({ data, ...props }) => (
      <EndpointCell
        relativeFilePath={data.diffableEntity.codeReference.relativeFilePath}
        httpMethod={data.diffableEntity.httpMethod}
        httpRoute={data.diffableEntity.httpRoute}
        {...props}
      />
    ),
  },
  {
    key: 'insights-column',
    label: 'Insights',
    width: '100rem',
    Cell: ({ data, ...props }) => (
      <InventoryInsightsCell insights={data.diffableEntity.insights} {...props} />
    ),
  },
  {
    key: 'source-column',
    label: 'Source',
    width: '15rem',
    Cell: ApiSourceCell,
    betaFeature: FeatureFlag.AkamaiInternetExposed,
  },
  {
    key: 'endpoint-column',
    label: 'Endpoint',
    width: '125rem',
    Cell: ApiEndpointCell,
    betaFeature: FeatureFlag.AkamaiInternetExposed,
  },
];

const IconsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;

  ${BaseIcon} {
    min-width: 6rem;
  }
`;

const CustomTooltip = styled(Tooltip)`
  max-width: 145rem;
`;
