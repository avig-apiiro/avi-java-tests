import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Badge, BadgeColors } from '@src-v2/components/badges';
import { Button } from '@src-v2/components/button-v2';
import { VendorState } from '@src-v2/components/circles';
import { ClampText } from '@src-v2/components/clamp-text';
import { ElementSeparator } from '@src-v2/components/element-separator';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { UpgradeRequestModal } from '@src-v2/components/marketing/upgrade-request-modal';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading4, Heading5, SubHeading4 } from '@src-v2/components/typography';
import { ConnectButton } from '@src-v2/containers/connectors/connections/cards/connect-button';
import { PlainConnectorCard } from '@src-v2/containers/connectors/connections/cards/plain-connector-card';
import { ComingSoonModal } from '@src-v2/containers/connectors/server-modal/coming-soon-modal';
import { ManagedModal } from '@src-v2/containers/connectors/server-modal/managed-modal';
import { ServerModal } from '@src-v2/containers/connectors/server-modal/server-modal';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProviderVisibilityStatus } from '@src-v2/types/enums/provider-visibility-status';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { isNonFunctionalServers } from '@src/utils/connectors-utils';

export function DefaultCard({
  provider,
  limited,
  section,
  subSection,
  ...props
}: {
  provider: ProviderGroup;
  limited: boolean;
  section: string;
  subSection: string;
}) {
  const [modalElement, setModal, closeModal] = useModalState();

  const openConnectModal = useCallback(
    () => setModal(<ServerModal providerGroup={provider} onClose={closeModal} />),
    [provider, setModal, closeModal]
  );

  const openUpgradeModal = useCallback(
    () => setModal(<UpgradeRequestModal onClose={closeModal} />),
    [setModal, closeModal]
  );

  const visibilityStatus =
    provider.visibilityStatusBySubType[subSection] ?? provider.visibilityStatus;

  return (
    <PlainConnectorCard {...props} provider={provider} icons={[provider.iconName ?? provider.key]}>
      <ConnectorCardContent provider={provider} visibilityStatus={visibilityStatus} />
      <HorizontalDivider />
      <ActionButtons
        provider={provider}
        limited={limited}
        section={section}
        visibilityStatus={visibilityStatus}
        openConnectModal={openConnectModal}
        openUpgradeModal={openUpgradeModal}
      />
      {modalElement}
    </PlainConnectorCard>
  );
}

const ActionButtons = ({
  limited,
  openUpgradeModal,
  provider,
  openConnectModal,
  section,
  visibilityStatus,
}) => {
  const [modalElement, setModal, closeModal] = useModalState();
  const trackAnalytics = useTrackAnalytics();
  const { application } = useInject();

  const handleLearnMoreClick = () => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Learn more',
      [AnalyticsDataField.ConnectorName]: provider.displayName,
    });
    setModal(<ComingSoonModal closeModal={closeModal} provider={provider} />);
  };

  const renderActionButton = useMemo(() => {
    if (limited) {
      return (
        <Button size={Size.MEDIUM} onClick={openUpgradeModal} variant={Variant.PRIMARY}>
          Upgrade to connect
        </Button>
      );
    }

    if (provider.managedByApiiro && !application.isFeatureEnabled(FeatureFlag.SemgrepUIConfig)) {
      return (
        <Button
          size={Size.MEDIUM}
          variant={provider.connected ? Variant.TERTIARY : Variant.PRIMARY}
          onClick={() =>
            setModal(
              <ManagedModal
                apiLink="https://docs.apiiro.com/api#tag/Managed-Semgrep"
                learnMoreLink="https://docs.apiiro.com/orchestrate-tools/managed_semgrep"
                modalContent="Apiiro's built-in Managed Semgrep automatically scans all your monitored code concurrently
          with Apiiro's native analysis according to your configured Semgrep rules and adds Apiiro
          context to get more informative and detailed code findings."
                closeModal={closeModal}
                provider={provider}
              />
            )
          }>
          {provider.connected ? 'Manage' : 'Connect'}
        </Button>
      );
    }

    if (ProviderVisibilityStatus.ComingSoon === visibilityStatus) {
      return (
        <Button size={Size.MEDIUM} variant={Variant.TERTIARY} onClick={handleLearnMoreClick}>
          Learn more
        </Button>
      );
    }

    if (provider.enableOnlyExternalUrl) {
      return (
        <Button size={Size.MEDIUM} variant={Variant.TERTIARY} href={provider.enableOnlyExternalUrl}>
          Enable Integration
        </Button>
      );
    }

    if (!provider.connected) {
      return <ConnectButton provider={provider} onConnect={openConnectModal} />;
    }

    return (
      <ButtonsContainer>
        <ConnectButton provider={provider} onConnect={openConnectModal} />
        <Button
          size={Size.MEDIUM}
          variant={Variant.TERTIARY}
          to={{
            pathname: `/connectors/manage/${provider.key}`,
            hash: `#${section}`,
          }}>
          Manage
        </Button>
      </ButtonsContainer>
    );
  }, [provider, section, openUpgradeModal, openConnectModal, limited]);

  return (
    <>
      <Actions>{renderActionButton}</Actions>
      {modalElement}
    </>
  );
};

const ConnectorCardContent = ({ provider, visibilityStatus }) => (
  <ConnectorCardContentWrapper>
    <Heading4>
      <ClampText>{provider.displayName ?? provider.key}</ClampText>
    </Heading4>
    <ElementSeparator as={SubHeading4}>
      {!provider.premiseOnly && !provider.managedByApiiro && 'Cloud'}
      {!provider.cloudOnly && !provider.managedByApiiro && 'On premises'}
      {provider.managedByApiiro && 'Orchestrated'}
    </ElementSeparator>

    {ProviderVisibilityStatus.Preview === visibilityStatus ? (
      <PreviewStatus>
        {Boolean(provider.servers?.length) && <CardStatusRevamp provider={provider} />}
        <Badge size={Size.XSMALL} color={BadgeColors.Purple}>
          Preview
        </Badge>
      </PreviewStatus>
    ) : ProviderVisibilityStatus.ComingSoon === visibilityStatus ? (
      <Badge size={Size.XSMALL} color={BadgeColors.Purple}>
        Coming soon
      </Badge>
    ) : (
      <CardStatusRevamp provider={provider} />
    )}
  </ConnectorCardContentWrapper>
);

const CardStatusRevamp = ({ provider }: { provider: ProviderGroup }) => {
  const providerGroupState = getProviderGroupState({ provider });
  return (
    <>
      <HeaderConnection data-connection-status={providerGroupState.type}>
        {(provider.servers?.length > 0 || (provider.managedByApiiro && provider.connected)) && (
          <SvgIcon
            name={providerGroupState.type === VendorState.Success ? 'Success' : 'Warning'}
            size={Size.XXSMALL}
          />
        )}
        {providerGroupState.description && <ClampText>{providerGroupState.description}</ClampText>}
      </HeaderConnection>
    </>
  );
};

const PreviewStatus = styled.div`
  display: flex;
  gap: 2rem;
`;

const HeaderConnection = styled(Heading5)`
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow: hidden;

  &[data-connection-status=${VendorState.Success}],
  &[data-connection-status=${VendorState.Attention}] {
    color: var(--color-green-60);

    ${BaseIcon} {
      color: var(--color-green-50);
    }
  }

  &[data-connection-status=${VendorState.Error}] {
    color: var(--color-red-55);

    ${BaseIcon} {
      color: var(--color-red-50);
    }
  }

  &[data-connection-status=${VendorState.Warning}] {
    color: var(--color-orange-60);

    ${BaseIcon} {
      color: var(--color-orange-55);
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 2rem;
`;

const ConnectorCardContentWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  color: var(--color-blue-gray-65);
  font-size: var(--font-size-s);
  gap: 2rem;
`;

export const HorizontalDivider = styled.hr`
  width: 100%;
  height: 0.25rem;
  background-color: var(--color-blue-gray-25);
  margin: 3rem 0;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 2rem;
`;

export const getProviderGroupState = ({ provider }: { provider: ProviderGroup }) => {
  const allNonFunctional = isNonFunctionalServers(provider.servers);
  const hasAboutToExpire = provider.servers?.some(
    server => Boolean(server.tokenExpireDate) && server.tokenDaysToExpire <= 14
  );
  const connectedStatus =
    provider.servers?.length > 0 || (provider.managedByApiiro && provider.connected);

  if (allNonFunctional) {
    return {
      type: VendorState.Error,
      description: 'Non functional',
      tooltip: 'None of your connections are functioning',
    };
  }
  if (provider.faultedCount > 0) {
    return {
      type: VendorState.Warning,
      description: 'Partially functional',
      tooltip: 'One (or more) of your connections has an issue',
    };
  }
  if (hasAboutToExpire) {
    return {
      type: VendorState.Attention,
      description: 'Connected',
      tooltip: 'Token for one or more connections will expire shortly',
    };
  }
  if (connectedStatus) {
    return { type: VendorState.Success, description: 'Connected' };
  }
  if (provider.enableOnlyExternalUrl) {
    return { type: null, description: null };
  }

  return { type: null, description: 'Not connected' };
};
