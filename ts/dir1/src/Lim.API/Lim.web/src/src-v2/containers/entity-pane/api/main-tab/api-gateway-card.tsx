import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ClampPath } from '@src-v2/components/clamp-text';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { VendorIcon } from '@src-v2/components/icons';
import { DateTime } from '@src-v2/components/time';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ExternalLink, ListItem, UnorderedList } from '@src-v2/components/typography';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { dateFormats } from '@src-v2/data/datetime';

export function ApiGatewayCard(props: ControlledCardProps) {
  const {
    element: { apiGatewaySummary },
  } = useApiPaneContext();

  return (
    <ControlledCard {...props} title="API gateway">
      <EvidenceLinesWrapper>
        <EvidenceLine isExtendedWidth label="API is exposed through">
          <VendorIcon
            name={(apiGatewaySummary.providerGroup ?? apiGatewaySummary.provider)?.toString()}
          />
          <ExternalLink href={apiGatewaySummary.gatewayUrl}>
            {apiGatewaySummary.displayName}
          </ExternalLink>
        </EvidenceLine>
        {apiGatewaySummary.exposureTime && (
          <EvidenceLine isExtendedWidth label="Exposed at">
            <DateTime date={apiGatewaySummary.exposureTime} format={dateFormats.longDate} />
          </EvidenceLine>
        )}
        {Boolean(apiGatewaySummary.serviceEndpointUrls?.length) && (
          <EvidenceLine isExtendedWidth label="HTTP(s) endpoints">
            {apiGatewaySummary.serviceEndpointUrls.map(endpoint => (
              <ExternalLink href={endpoint}>
                <ClampPath>{endpoint}</ClampPath>
              </ExternalLink>
            ))}
          </EvidenceLine>
        )}
        {Boolean(apiGatewaySummary.apiOperations?.length) && (
          <EvidenceLine isExtendedWidth label="Groups">
            <UnorderedListWithoutPadding>
              {apiGatewaySummary.apiOperations.map((operation, index) => (
                <ListItem key={index}>
                  <Tooltip content={operation.urls?.join(', ')}>
                    <span>{operation.method ?? ''}</span>
                  </Tooltip>
                </ListItem>
              ))}
            </UnorderedListWithoutPadding>
          </EvidenceLine>
        )}
        {apiGatewaySummary.listenPath && (
          <EvidenceLine isExtendedWidth label="Listen path">
            {apiGatewaySummary.listenPath}
          </EvidenceLine>
        )}
        {Boolean(apiGatewaySummary.listenPort) && (
          <EvidenceLine isExtendedWidth label="Listen port">
            {apiGatewaySummary.listenPort}
          </EvidenceLine>
        )}
        {apiGatewaySummary.forwardUrl && (
          <EvidenceLine isExtendedWidth label="Forward URL">
            {apiGatewaySummary.forwardUrl}
          </EvidenceLine>
        )}
        {apiGatewaySummary.forwardPath && (
          <EvidenceLine isExtendedWidth label="Forward path">
            {apiGatewaySummary.forwardPath}
          </EvidenceLine>
        )}
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}

const UnorderedListWithoutPadding = styled(UnorderedList)`
  padding: 0;
`;
