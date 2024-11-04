import _ from 'lodash';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { InputV2 } from '@src-v2/components/forms';
import { SearchFilterInput } from '@src-v2/components/forms/search-input';
import { SvgIcon } from '@src-v2/components/icons';
import { ErrorLayout } from '@src-v2/components/layout';
import {
  SubNavigationMenu,
  SubNavigationMenuOptionType,
} from '@src-v2/components/sub-navigation-menu';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Size } from '@src-v2/components/types/enums/size';
import { SubHeading4 } from '@src-v2/components/typography';
import { RequestNewIntegration } from '@src-v2/containers/connectors/connections/cards/request-new-integration';
import {
  ProviderCardTilesLayout,
  SelectedProvidersLayout,
} from '@src-v2/containers/connectors/connections/catalog/connectors-provider-layouts';
import { useConnectors } from '@src-v2/containers/connectors/connections/catalog/use-connectors';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { ProviderType } from '@src-v2/types/providers/provider-type';
import { makeUrl } from '@src-v2/utils/history-utils';

export const ConnectorsCatalog = observer(() => {
  const history = useHistory();
  const params: { key?: string } = useParams();
  const { connectors } = useInject();
  const { activeFilters } = useFilters();
  const providerTypes = useSuspense(connectors.getProviderTypes);

  const { filteredFlatAllProviderGroups, currentProviderType, setCurrentProviderType } =
    useConnectors();

  const [connectedProviderGroups, suggestedProviderGroups] = useMemo(() => {
    return partitionConnectedSuggested(filteredFlatAllProviderGroups);
  }, [filteredFlatAllProviderGroups]);

  const onNestedMenuChange = (option?: SubNavigationMenuOptionType) => {
    const current = providerTypes.find(provider => provider.key === option?.key);
    setCurrentProviderType(current);

    const defaultSubType = current?.subTypes?.[0]?.subType;
    history.push(
      makeUrl(
        `/connectors/connect${option?.key ? `/${option?.key}` : ''}${defaultSubType ? `/${defaultSubType}` : ''}`,
        {
          fl: activeFilters,
        }
      )
    );
  };

  const navigationOptions = buildSubNavigationOptions(providerTypes);

  return (
    <>
      <Header>
        <SearchControls>
          <SearchFilterInput
            placeholder="Search by connector name..."
            defaultValue={activeFilters.searchTerm}
          />
        </SearchControls>
        <TextButton to="/connectors/manage">
          Manage all connectors <SvgIcon name="Arrow" size={Size.XSMALL} />
        </TextButton>
      </Header>
      <GridContainer>
        <SideMenuWrapper>
          <SideMenuContainer>
            <SubNavigationMenu
              options={navigationOptions}
              currentOption={currentProviderType}
              title="Connector type"
              allOptionLabel="All types"
              onChange={onNestedMenuChange}
            />
            <RequestNewIntegration />
          </SideMenuContainer>
        </SideMenuWrapper>
        <ProvidersContainer>
          {!params?.key ? (
            <ConnectorsContainer>
              {connectedProviderGroups.length > 0 && (
                <ConnectorRowContainer>
                  <CounterRowContainer>
                    <SubHeading4>Connected</SubHeading4>
                    <Counter>{connectedProviderGroups.length} connectors</Counter>
                  </CounterRowContainer>

                  <ProviderCardTilesLayout providerGroups={connectedProviderGroups} />
                </ConnectorRowContainer>
              )}

              {suggestedProviderGroups.length > 0 && (
                <ConnectorRowContainer>
                  <CounterRowContainer>
                    <SubHeading4>Not Connected</SubHeading4>
                    <Counter>{suggestedProviderGroups.length} connectors</Counter>
                  </CounterRowContainer>
                  <ProviderCardTilesLayout providerGroups={suggestedProviderGroups} />
                </ConnectorRowContainer>
              )}

              {!suggestedProviderGroups.length && !connectedProviderGroups.length && (
                <ErrorLayout.NoResults />
              )}
            </ConnectorsContainer>
          ) : (
            <SelectedProvidersLayout currentProviderType={currentProviderType} />
          )}
        </ProvidersContainer>
      </GridContainer>
    </>
  );
});

export const partitionConnectedSuggested = (providerGroups = []) => {
  const [connectedGroups, suggestedGroups] = _.partition(
    providerGroups,
    provider => provider.connected
  );

  return [connectedGroups, suggestedGroups];
};

export const buildSubNavigationOptions = (providerTypes: ProviderType[]) =>
  providerTypes.map(provider => ({
    key: provider.key,
    label: provider.title,
  }));

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 60rem calc(100% - 60rem);
`;

const SideMenuWrapper = styled.div`
  position: relative;
`;

const SideMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  position: sticky;
  top: 6rem;
  width: 54rem;

  ${SubNavigationMenu} {
    position: unset;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const SearchControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${InputV2} {
    width: 80rem;
    height: 8rem;
  }
`;

export const ProvidersContainer = styled.div`
  --card-tiles-max-width: 75rem;

  display: flex;
  flex-direction: column;

  ${Tabs} {
    margin-bottom: 5rem;
  }
`;

export const CounterRowContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

export const Counter = styled.span`
  font-size: var(--font-size-s);
  color: var(--color-blue-gray-60);
`;

const ConnectorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6rem;
`;

const ConnectorRowContainer = styled(ConnectorsContainer)`
  gap: 3rem;
`;
