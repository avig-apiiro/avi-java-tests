import { differenceInHours } from 'date-fns';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { Button, CircleButton } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { VendorCircle, VendorState } from '@src-v2/components/circles';
import { SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading5, ListItem, NavLink, SubHeading4 } from '@src-v2/components/typography';
import { ConnectionManageDropdown } from '@src-v2/containers/connectors/management/connection-manage-dropdown';
import {
  ConnectionStatus,
  ErrorCategory,
  TWO_WEEKS_TIME,
} from '@src-v2/containers/connectors/management/connection-row';
import { useConnectionMenuModals } from '@src-v2/containers/connectors/use-connection-menu-modal';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { preventDefault } from '@src-v2/utils/dom-utils';

const MonitorStatus = ({ monitorNewStatus, connectorGroup }) => {
  const archivedStatus = !connectorGroup.types?.SourceCode
    ? ''
    : monitorNewStatus.monitorArchivedRepositories
      ? '(Incl. archived)'
      : '(Excl. archived)';

  const status = monitorNewStatus.monitorAllNew
    ? `All new ${archivedStatus}`
    : monitorNewStatus.repositoriesGroupsWithMonitorNew.length > 0
      ? `All in selected groups ${archivedStatus}`
      : 'Disabled';

  return (
    <ListItemWrapper>
      <SubHeading4>
        Auto monitoring new {connectorGroup.types?.SourceCode && 'repositories &'}{' '}
        {connectorGroup.displayName === 'Wiz' ? 'container images' : 'projects'}:
      </SubHeading4>
      <Heading5>{status}</Heading5>
    </ListItemWrapper>
  );
};

export const ConnectionOverview = observer(() => {
  const { connectionUrl } = useParams<{ connectionUrl: string }>();
  const { connectors, rbac, application } = useInject();

  const brokerConnections = useSuspense(connectors.searchConnectionNetworkBroker);
  const connectedBrokerServersCount = brokerConnections.items.filter(
    connection => connection.isConnected
  ).length;

  const [connection, summaries, monitorNewStatus, connectorGroups] = useSuspense([
    [connectors.getConnection, { key: connectionUrl }] as const,
    [connectors.getConnectionSummary, { key: connectionUrl }] as const,
    [connectors.getMonitorNewStatus, { key: connectionUrl }] as const,
    connectors.getProviderGroups,
  ]);

  // TODO: split this call as if fails as part of the array of useSuspense - need to figure out a solution for useSuspense
  const providerTypes = useSuspense(connectors.getProviderTypes);

  const [modalElement, { handleEdit }] = useConnectionMenuModals(connection, connectorGroups);

  const connectorGroup = useMemo(() => {
    return connectorGroups.find(connector => connector.key === connection.providerGroup);
  }, [connection, connectorGroups]);

  const connectorProvider = useMemo(
    () =>
      providerTypes.find(providerType => {
        return (
          providerType.key ===
          Object.keys(connectorGroup.types)?.find(type =>
            _.map(providerTypes, 'key').includes(type)
          )
        );
      }),
    [providerTypes, connectorGroup]
  );

  const canEdit = rbac.canEdit(resourceTypes.Connectors) && connectorGroup.key !== 'NetworkBroker';

  const shouldShowSettingsIcon =
    (connectorGroup.key !== 'Perforce' && connectorGroup.types.hasOwnProperty('SourceCode')) ||
    (connectorGroup.key === 'Jira' &&
      application.isFeatureEnabled(FeatureFlag.Jira2WayIntegration));

  const settingsPageUrl = `/connectors/manage/server/${connectionUrl}/settings`;

  const tokenExpireDaysLeft = connection.tokenExpireDate
    ? Math.ceil(differenceInHours(new Date(connection.tokenExpireDate), new Date()) / 24)
    : undefined;

  const vendorState = useMemo(() => {
    const isExpired = tokenExpireDaysLeft < 0;
    const isAboutToExpire = tokenExpireDaysLeft <= TWO_WEEKS_TIME && tokenExpireDaysLeft >= 0;
    const errorCategory =
      connection?.activeActionableErrors[0]?.errorDetails?.errorCategory ?? ErrorCategory.None;

    if (
      isExpired ||
      !connection.isReachable ||
      (errorCategory !== ErrorCategory.None && errorCategory !== ErrorCategory.Authorization)
    ) {
      return VendorState.Error;
    }

    if (errorCategory === ErrorCategory.Authorization) {
      return VendorState.Warning;
    }

    if (isAboutToExpire) {
      return VendorState.Attention;
    }

    return null;
  }, [connection.isReachable, tokenExpireDaysLeft, connection?.activeActionableErrors]);

  return (
    <ConnectionOverviewCard>
      <VendorCircle
        state={vendorState}
        size={Size.XXLARGE}
        name={connectorGroup.iconName ?? connectorGroup.key}
      />
      {connectorGroup.key === 'NetworkBroker' ? (
        <DetailsList>
          <ListItemWrapper>
            <SubHeading4>Status:</SubHeading4>
            <Heading5>
              {connection.isReachable ? 'Connected' : 'Not Connected (Tunnel Error)'}
            </Heading5>
          </ListItemWrapper>
          <ListItemWrapper>
            <SubHeading4>Configured hosts:</SubHeading4>
            <Heading5>
              {connectedBrokerServersCount}/{brokerConnections.items.length}
            </Heading5>
          </ListItemWrapper>
        </DetailsList>
      ) : (
        <DetailsList>
          {summaries.map(summary => (
            <ListItemWrapper key={summary.key}>
              <SubHeading4>
                Monitored {_.lowerCase(summary.label).replace('api', 'API')}:
              </SubHeading4>
              <Heading5>
                {summary.monitored ?? 0}/{summary.total}
              </Heading5>
            </ListItemWrapper>
          ))}
          <MonitorStatus monitorNewStatus={monitorNewStatus} connectorGroup={connectorGroup} />
        </DetailsList>
      )}
      <IconsBrokerBadgeContainer>
        {canEdit && (
          <IconsContainer>
            {(tokenExpireDaysLeft < 0 || tokenExpireDaysLeft <= TWO_WEEKS_TIME) && (
              <TokenButton
                size={Size.MEDIUM}
                onClick={event => {
                  handleEdit();
                  preventDefault(event);
                }}>
                Update token
              </TokenButton>
            )}
            <ConnectionStatus
              tokenExpireDaysLeft={tokenExpireDaysLeft}
              server={connection}
              handleEdit={handleEdit}
              canEdit={canEdit}
              activeActionableErrors={connection.activeActionableErrors}
            />
            {shouldShowSettingsIcon && (
              <Tooltip content="Connection settings">
                <CircleButton
                  to={settingsPageUrl}
                  size={Size.MEDIUM}
                  variant={Variant.TERTIARY}
                  onClick={handleEdit}>
                  <SvgIcon name="Settings" />
                </CircleButton>
              </Tooltip>
            )}
            <ConnectionManageDropdown
              disabled={!connectorGroup.editable}
              monitorEnabled={connectorProvider.monitorEnabled}
              server={connection}
            />
          </IconsContainer>
        )}
        {connection.isRoutedViaNetworkBroker && <Badge>Via broker</Badge>}
      </IconsBrokerBadgeContainer>

      {modalElement}
    </ConnectionOverviewCard>
  );
});

const TokenButton = styled(Button)`
  margin-right: 1rem;
`;

const ListItemWrapper = styled(ListItem)`
  display: flex;
  gap: 1rem;
`;

const ConnectionOverviewCard = styled(Card)`
  display: flex;
  padding: 5rem 3rem 5rem 5rem;
  gap: 4rem;
  margin-bottom: 6rem;
`;

const DetailsList = styled.ul`
  flex-grow: 1;

  ${NavLink}.active {
    font-weight: 500;
  }
`;

const IconsBrokerBadgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
`;
