import { differenceInHours } from 'date-fns';
import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { AsyncBoundary, DefaultPendingFallback } from '@src-v2/components/async-boundary';
import { Badge } from '@src-v2/components/badges';
import { Button } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { ElementSeparator } from '@src-v2/components/element-separator';
import { Heading4, SubHeading4 } from '@src-v2/components/typography';
import {
  FaultedIcon,
  TokenExpirationDateAlert,
} from '@src-v2/containers/connectors/management/alert-icons';
import { ConnectionManageDropdown } from '@src-v2/containers/connectors/management/connection-manage-dropdown';
import { ConnectionIcon } from '@src-v2/containers/connectors/server-tables/connection-artifacts-table';
import { useConnectionMenuModals } from '@src-v2/containers/connectors/use-connection-menu-modal';
import { HelpModal } from '@src-v2/containers/modals/help-modal';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { Connection } from '@src-v2/types/connector/connectors';
import { dataAttr, preventDefault } from '@src-v2/utils/dom-utils';
import { arrayJoinConjunction } from '@src-v2/utils/string-utils';
import { Size } from '@src/src-v2/components/types/enums/size';

export const TWO_WEEKS_TIME = 14;

export const ConnectionRow = observer(
  ({
    server,
    disabled,
    manageable,
    monitorEnabled,
    providerKey,
    providerRouteUrl,
    isSingleConnection = false,
    ...props
  }) => {
    const { connectors, rbac } = useInject();
    const providerGroups = useSuspense(connectors.getProviderGroups);
    const canEdit = rbac.canEdit(resourceTypes.Connectors);

    const tokenExpireDaysLeft = server.tokenExpireDate
      ? Math.ceil(differenceInHours(new Date(server.tokenExpireDate), new Date()) / 24)
      : undefined;

    const [modalElement, { handleEdit }] = useConnectionMenuModals(server, providerGroups);

    return (
      <RowContainer
        {...props}
        to={
          manageable
            ? {
                pathname: `/connectors/manage/server/${encodeURIComponent(server.url)}/${providerRouteUrl}`,
                state: { isSingleConnection },
              }
            : null
        }
        data-status={server.isReachable ? 'success' : 'failure'}>
        <ContentContainerOverflow>
          <ConnectionStatus
            tokenExpireDaysLeft={tokenExpireDaysLeft}
            server={server}
            disabled={disabled}
            handleEdit={handleEdit}
            canEdit={canEdit}
            activeActionableErrors={server.activeActionableErrors}
          />
          <ElementSeparator as={EllipsisSubHeading}>
            <UrlRowText>{server.url.split('/?')[0]}</UrlRowText>
            {server.description ?? server.username}
            {server.monitorNew &&
              `Automatically monitoring new ${arrayJoinConjunction(
                [
                  server.providesRepositories && 'repositories',
                  (server.providesIssueProjects || server.providesFindingsReport) && 'projects',
                ],
                '&'
              )}`}
          </ElementSeparator>
          {server.isRoutedViaNetworkBroker && <Badge>Via broker</Badge>}
        </ContentContainerOverflow>

        <AsyncBoundary pendingFallback={<PendingFallback />}>{modalElement}</AsyncBoundary>
        <ContentContainer>
          {canEdit && (tokenExpireDaysLeft < 0 || tokenExpireDaysLeft <= TWO_WEEKS_TIME) && (
            <Button
              size={Size.MEDIUM}
              onClick={event => {
                handleEdit();
                preventDefault(event);
              }}>
              Update token
            </Button>
          )}
          <ConnectionManageDropdown
            disabled={disabled}
            monitorEnabled={monitorEnabled}
            server={server}
          />
        </ContentContainer>
      </RowContainer>
    );
  }
);

type ConnectionStatusType = {
  server: Connection;
  tokenExpireDaysLeft: number;
  canEdit: boolean;
  disabled?: boolean;
  handleEdit: () => void;
  activeActionableErrors: any[];
  connectedToBroker?: boolean;
  brokerReachable?: boolean;
};

export enum ErrorCategory {
  Authorization = 'Authorization',
  Authentication = 'Authentication',
  None = 'None',
  BrokerUnreachable = 'BrokerUnreachable',
}

export const ConnectionStatus = ({
  server,
  tokenExpireDaysLeft,
  canEdit,
  disabled,
  handleEdit,
  activeActionableErrors,
  connectedToBroker,
  brokerReachable,
}: ConnectionStatusType) => {
  const [modalElement, setModal, closeModal] = useModalState();

  const handleContactHelpClick = useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    setModal(<HelpModal onClose={closeModal} />);
  }, []);

  const isExpired = tokenExpireDaysLeft < 0;
  const isAboutToExpire = tokenExpireDaysLeft <= TWO_WEEKS_TIME && tokenExpireDaysLeft >= 0;
  const errorCategory: ErrorCategory =
    connectedToBroker && !brokerReachable
      ? ErrorCategory.BrokerUnreachable
      : activeActionableErrors[0]?.errorDetails?.errorCategory ?? ErrorCategory.None;

  const serverNotReachableContent = useMemo(() => {
    switch (errorCategory) {
      case ErrorCategory.Authorization:
        return (
          <>
            <Heading4>Authorization issue</Heading4>
            Review your settings to ensure all required permissions are granted
          </>
        );
      case ErrorCategory.Authentication:
        return (
          <>
            <Heading4>Authentication issue</Heading4>
            Review your settings and ensure your token is up to date
          </>
        );
      case ErrorCategory.BrokerUnreachable:
        return (
          <>
            <Heading4>Broker tunnel error</Heading4>
            Failure connecting with network broker
          </>
        );
      default:
        return (
          <>
            <Heading4>Connection issue</Heading4>
            <TooltipDescription>
              If the problem persists,
              <TriggerModalButton onClick={handleContactHelpClick}>
                contact Apiiro support
              </TriggerModalButton>
            </TooltipDescription>
          </>
        );
    }
  }, [errorCategory]);

  const shouldShowTokenExpirationDateAlert = isExpired || isAboutToExpire;

  const shouldShowFaultedIcon =
    !isExpired && (!server.isReachable || errorCategory !== ErrorCategory.None);

  const shouldShowConnectionIcon = !shouldShowFaultedIcon && brokerReachable && connectedToBroker;

  return (
    <>
      {shouldShowTokenExpirationDateAlert && (
        <TokenExpirationDateAlert
          dateDifference={tokenExpireDaysLeft}
          canEdit={canEdit}
          disabled={disabled}
          handleEdit={handleEdit}
        />
      )}
      {shouldShowFaultedIcon && (
        <FaultedIcon
          isWarning={errorCategory === ErrorCategory.Authorization}
          size={Size.XSMALL}
          content={serverNotReachableContent}
        />
      )}
      {shouldShowConnectionIcon && (
        <ConnectionIcon data-connected={dataAttr(true)} name="Success" />
      )}
      {modalElement}
    </>
  );
};

const RowContainer = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 3rem;
  padding: 3rem 4rem;
  gap: 2rem;
`;

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${Badge} {
    margin-left: 2rem;
  }
`;

const ContentContainerOverflow = styled(ContentContainer)`
  overflow: hidden;
`;

const PendingFallback = styled(DefaultPendingFallback)`
  flex-grow: 0;

  ${LogoSpinner} {
    height: 5rem;
  }
`;

const UrlRowText = styled.span`
  color: var(--color-blue-gray-65);
  font-weight: 600;
`;

const EllipsisSubHeading = styled(SubHeading4)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TooltipDescription = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TriggerModalButton = styled.div`
  text-decoration: underline;
  cursor: pointer;
`;
