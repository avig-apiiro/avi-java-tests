import { observer } from 'mobx-react';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { VendorCircle } from '@src-v2/components/circles';
import { SearchFilterInput } from '@src-v2/components/forms/search-input';
import { SvgIcon } from '@src-v2/components/icons';
import { ErrorLayout } from '@src-v2/components/layout';
import {
  SubNavigationMenu,
  SubNavigationMenuOptionType,
} from '@src-v2/components/sub-navigation-menu';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading4, SubHeading4 } from '@src-v2/components/typography';
import { getProviderGroupState } from '@src-v2/containers/connectors/connections/cards/default-card';
import {
  SearchControls,
  buildSubNavigationOptions,
} from '@src-v2/containers/connectors/connections/catalog/connectors-catalog';
import { ConnectionRow } from '@src-v2/containers/connectors/management/connection-row';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { Connection } from '@src-v2/types/connector/connectors';
import { ProviderGroupType } from '@src-v2/types/enums/provider-group-type';
import { ApiProviderGroup } from '@src-v2/types/providers/api-provider-group';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { ProviderType } from '@src-v2/types/providers/provider-type';
import { addInterpunctSeparator } from '@src-v2/utils/string-utils';

export const ManageConnections = observer(() => {
  const { connectors } = useInject();
  const { activeFilters } = useFilters();
  const providerTypes = useSuspense(connectors.getProviderTypes);

  const { hash } = useLocation();
  const selectedProviderType = hash ? hash.substring(1) : '';

  const [activeType, setActiveType] = useState(
    providerTypes.find(providerType => providerType.key === selectedProviderType) ??
      providerTypes[0]
  );

  const currentProviderType = useMemo(() => {
    const activeProviderType = providerTypes.find(provider => provider.key === activeType.key);

    if (activeFilters.searchTerm) {
      const customProviderGroups = activeProviderType.providerGroups.reduce(
        (
          result: (ProviderGroup | ApiProviderGroup)[],
          provider: ProviderGroup | ApiProviderGroup
        ) => {
          const customServers = getFilteredServers(activeFilters.searchTerm, provider.servers);
          if (customServers?.length === 0) {
            return result;
          }
          return [...result, { ...provider, servers: customServers }];
        },
        []
      );
      return { ...activeProviderType, providerGroups: customProviderGroups };
    }
    return activeProviderType;
  }, [providerTypes, activeFilters.searchTerm, activeType]);

  const onNestedMenuChange = (option?: SubNavigationMenuOptionType) => {
    const currentProvider = providerTypes.find(provider => provider.key === option?.key);
    setActiveType(currentProvider);
  };

  const navigationOptions = buildSubNavigationOptions(providerTypes);

  return (
    <>
      <SearchControls>
        <SearchFilterInput
          placeholder="Search by connection name..."
          defaultValue={activeFilters.searchTerm}
        />
        {currentProviderType?.key === ProviderGroupType.SourceCode && (
          <TextButton
            to={{
              pathname: '/connectors/manage/repositories',
              state: { isAllRepositories: true },
            }}>
            View all repositories <SvgIcon name="Arrow" size={Size.XSMALL} />
          </TextButton>
        )}
      </SearchControls>
      <GridContainer>
        <SelectMenuContainer>
          <SubNavigationMenu
            options={navigationOptions}
            currentOption={activeType}
            onChange={onNestedMenuChange}
            title="Connector type"
          />
        </SelectMenuContainer>
        <ProvidersContainer>
          {currentProviderType?.providerGroups?.length > 0 &&
          currentProviderType.servers?.length > 0 ? (
            currentProviderType.providerGroups
              .filter((provider: ProviderGroup | ApiProviderGroup) => provider.servers?.length > 0)
              .map((provider: ProviderGroup | ApiProviderGroup) => {
                const providerGroupState = getProviderGroupState({ provider });
                return (
                  <SingleProvider key={provider.key}>
                    <DescriptionContainer>
                      <Tooltip
                        content={providerGroupState.tooltip}
                        disabled={!providerGroupState.tooltip}>
                        <VendorCircle
                          name={provider.key}
                          size={Size.XXLARGE}
                          state={providerGroupState.type}
                        />
                      </Tooltip>
                      <Title>
                        <Heading4>{provider.displayName ?? provider.key}</Heading4>
                        <SubHeading4>
                          {addInterpunctSeparator(
                            ...getProviderTypesForServer(provider.key, providerTypes)
                          )}
                        </SubHeading4>
                      </Title>
                    </DescriptionContainer>
                    <OptionsList>
                      {provider.servers.map((server: Connection) => (
                        <ConnectionRow
                          key={server.url}
                          providerRouteUrl={currentProviderType.providerRouteUrl}
                          providerKey={currentProviderType.key}
                          server={server}
                          manageable={currentProviderType.manageable}
                          disabled={!currentProviderType.editable}
                          monitorEnabled={currentProviderType.monitorEnabled}
                        />
                      ))}
                    </OptionsList>
                  </SingleProvider>
                );
              })
          ) : (
            <ErrorLayout.NoResults />
          )}
        </ProvidersContainer>
      </GridContainer>
    </>
  );
});

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 60rem calc(100% - 60rem);
`;

const ProvidersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6rem;
`;

const SingleProvider = styled(ProvidersContainer)`
  gap: 4rem;
`;

const DescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const SelectMenuContainer = styled.div``;

export const getProviderTypesForServer = (serverKey: string, providerTypes: ProviderType[]) => {
  const flatProviderGroups = providerTypes.flatMap(type => type.providerGroups);
  const currentServer = flatProviderGroups.find(group => group.key === serverKey);

  return (
    Object.keys(currentServer.types).map(
      key => providerTypes.find(provider => provider.key === key)?.title ?? ''
    ) ?? []
  );
};

export const getFilteredServers = (searchTerm, servers = []) =>
  servers.filter(
    (server: Connection) =>
      // @ts-ignore
      server.url?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      // @ts-ignore
      server.description
        ?.toLowerCase()
        // @ts-ignore
        ?.includes(searchTerm?.toLowerCase())
  );
