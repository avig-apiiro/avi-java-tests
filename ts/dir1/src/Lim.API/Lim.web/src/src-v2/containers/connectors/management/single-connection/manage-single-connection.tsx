import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button, TextButton } from '@src-v2/components/button-v2';
import { VendorCircle } from '@src-v2/components/circles';
import { SearchFilterInput } from '@src-v2/components/forms/search-input';
import { SvgIcon } from '@src-v2/components/icons';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading4, SubHeading4 } from '@src-v2/components/typography';
import { getProviderGroupState } from '@src-v2/containers/connectors/connections/cards/default-card';
import { SearchControls } from '@src-v2/containers/connectors/connections/catalog/connectors-catalog';
import {
  getFilteredServers,
  getProviderTypesForServer,
} from '@src-v2/containers/connectors/management/manage-connections';
import { ConnectionRows } from '@src-v2/containers/connectors/management/single-connection/connection-rows';
import { ConnectorEventsTable } from '@src-v2/containers/connectors/management/single-connection/connector-events-table';
import { ServerModal } from '@src-v2/containers/connectors/server-modal/server-modal';
import { PullRequestKillSwitch } from '@src-v2/containers/pages/general-settings/kill-switch-control/pr-scan-killswitch';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Provider } from '@src-v2/types/enums/provider';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { ProviderGroupType } from '@src-v2/types/enums/provider-group-type';
import { ApiProviderGroup } from '@src-v2/types/providers/api-provider-group';
import { addInterpunctSeparator } from '@src-v2/utils/string-utils';

export const ManageSingleConnection = observer(props => {
  const { hash } = useLocation();
  const history = useHistory();
  const params: { key?: string } = useParams();
  const { connectors, application, rbac } = useInject();
  const { activeFilters } = useFilters();
  const providerTypes = useSuspense(connectors.getProviderTypes);
  const [modalElement, setModal, closeModal] = useModalState();
  const hasHash = hash?.length > 1; // hash can be # so we check for bigger string

  const isConnectorEventsEnabled =
    application.isFeatureEnabled(FeatureFlag.ConnectorEvents) &&
    rbac.canEdit(resourceTypes.Connectors);

  const providerGroupByKey = useMemo(
    () =>
      providerTypes
        .flatMap(provider => provider.providerGroups)
        .find(
          (provider: ProviderGroup | ApiProviderGroup) =>
            provider.key?.toLowerCase() === params?.key?.toLowerCase()
        ),
    [providerTypes]
  );

  const [currentProviderGroupByKey, setCurrentProvideGroupByKey] = useState(providerGroupByKey);
  const providerGroupState = getProviderGroupState({ provider: currentProviderGroupByKey });

  const openConnectModal = useCallback(
    () => setModal(<ServerModal providerGroup={providerGroupByKey} onClose={closeModal} />),
    [providerGroupByKey, setModal, closeModal]
  );

  // this is default providerType for connectionRow props
  const defaultProviderType = useMemo(() => {
    if (!_.isNil(providerGroupByKey.typeOverride)) {
      return providerTypes.find(provider => provider.key === providerGroupByKey.typeOverride);
    }

    if (hasHash) {
      return providerTypes.find(
        provider => provider.key?.toLowerCase() === hash.slice(1).toLowerCase()
      );
    }

    return providerTypes.find(provider =>
      provider.providerGroups.some(group => group.key === providerGroupByKey.key)
    );
  }, [providerTypes, providerGroupByKey, hash]);

  useEffect(() => {
    if (activeFilters.searchTerm) {
      if (providerGroupByKey) {
        const customServers = getFilteredServers(
          activeFilters.searchTerm,
          providerGroupByKey.servers
        );
        setCurrentProvideGroupByKey({ ...providerGroupByKey, servers: customServers });
      }
    } else {
      setCurrentProvideGroupByKey(providerGroupByKey);
    }
  }, [activeFilters.searchTerm, providerGroupByKey]);

  if (!providerGroupByKey?.connected) {
    history.push('/connectors/manage');
  }

  const multipleConnectionsAllowed =
    !currentProviderGroupByKey.isOAuthConnectionProvider &&
    !currentProviderGroupByKey.isOAuthConnectionProviderForSaas &&
    currentProviderGroupByKey.displayName !== 'Perforce' &&
    currentProviderGroupByKey.key !== 'NetworkBroker';

  const canConnect =
    rbac.canEdit(resourceTypes.Connectors) &&
    (multipleConnectionsAllowed || !currentProviderGroupByKey.servers?.length);

  return (
    <>
      <SingleProvider {...props}>
        <Header>
          <DescriptionContainer>
            <Tooltip content={providerGroupState.tooltip} disabled={!providerGroupState.tooltip}>
              <VendorCircle
                name={currentProviderGroupByKey?.key}
                size={Size.XXLARGE}
                state={providerGroupState.type}
              />
            </Tooltip>
            <Title>
              <Heading4>
                {currentProviderGroupByKey?.displayName ?? currentProviderGroupByKey?.key}
              </Heading4>
              <SubHeading4>
                {addInterpunctSeparator(
                  ...getProviderTypesForServer(currentProviderGroupByKey?.key, providerTypes)
                )}
              </SubHeading4>
            </Title>
          </DescriptionContainer>
          <Actions>
            {providerGroupByKey?.docsUrl && (
              <Button
                href={providerGroupByKey?.docsUrl}
                variant={Variant.TERTIARY}
                endIcon="External">
                Documentation
              </Button>
            )}
            {application.isFeatureEnabled(FeatureFlag.KillSwitch) &&
              rbac.canEdit(resourceTypes.Global) &&
              currentProviderGroupByKey.key === Provider.AzureDevops && <PullRequestKillSwitch />}
            <Button
              onClick={openConnectModal}
              size={Size.LARGE}
              variant={Variant.SECONDARY}
              disabled={!canConnect}>
              Add another
            </Button>
          </Actions>
        </Header>
        {isConnectorEventsEnabled && (
          <Tabs
            tabs={[
              {
                key: 'connections',
                label: `Connections`,
                to: `/connectors/manage/${currentProviderGroupByKey.key}/connections`,
              },
              {
                key: 'system-events',
                label: 'System events',
                to: `/connectors/manage/${currentProviderGroupByKey.key}/events`,
              },
            ]}
          />
        )}
        <ManageSingleConnectionContent>
          <AsyncBoundary>
            <Switch>
              {isConnectorEventsEnabled && (
                <Route
                  path="/connectors/manage/:key/events"
                  component={ConnectorEventsTable}
                  exact
                />
              )}
              <Route
                path="/connectors/manage/:key/connections"
                component={() => (
                  <>
                    <SearchControls>
                      <SearchFilterInput
                        placeholder="Search by name"
                        defaultValue={activeFilters.searchTerm}
                      />
                      {providerGroupByKey?.types.hasOwnProperty?.(ProviderGroupType.SourceCode) && (
                        <TextButton
                          to={{
                            pathname: '/connectors/manage/repositories',
                            state: { isSingleConnection: true, isAllRepositories: true },
                          }}>
                          View all repositories <SvgIcon name="Arrow" size={Size.XSMALL} />
                        </TextButton>
                      )}
                    </SearchControls>
                    <ConnectionRows
                      currentProviderGroupByKey={currentProviderGroupByKey}
                      defaultProviderType={defaultProviderType}
                    />
                  </>
                )}
                exact
              />
              <Redirect to={`/connectors/manage/${currentProviderGroupByKey.key}/connections`} />;
            </Switch>
          </AsyncBoundary>
        </ManageSingleConnectionContent>
      </SingleProvider>
      {modalElement}
    </>
  );
});

const ProvidersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6rem;
`;

const SingleProvider = styled(ProvidersContainer)`
  gap: 4rem;
`;

const ManageSingleConnectionContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 3rem;
  ${Button} {
    &[data-variant=${Variant.TERTIARY}] {
      background-color: transparent;
      &:hover {
        background-color: var(--color-blue-gray-20);
      }
    }
  }
`;
