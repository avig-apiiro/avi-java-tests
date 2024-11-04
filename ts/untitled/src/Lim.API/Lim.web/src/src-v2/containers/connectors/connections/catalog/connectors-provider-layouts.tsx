import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { CardTiles } from '@src-v2/components/cards/card-containers';
import { SvgIcon } from '@src-v2/components/icons';
import { ErrorLayout } from '@src-v2/components/layout';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { SubHeading4 } from '@src-v2/components/typography';
import { ConnectorCardFactory } from '@src-v2/containers/connectors/connections/cards/connector-card-factory';
import {
  Counter,
  CounterRowContainer,
  ProvidersContainer,
  partitionConnectedSuggested,
} from '@src-v2/containers/connectors/connections/catalog/connectors-catalog';
import { connectorsMapper } from '@src-v2/data/marketing';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { ApiProviderGroup } from '@src-v2/types/providers/api-provider-group';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { ProviderType } from '@src-v2/types/providers/provider-type';
import { makeUrl } from '@src-v2/utils/history-utils';
import { compareProviderGroups } from '@src/utils/connectors-utils';

export type SubType = {
  subType: string;
  displayName: string;
  providerGroups: (ProviderGroup | ApiProviderGroup)[];
};

export const SelectedProvidersLayout = ({
  currentProviderType,
  ...props
}: {
  currentProviderType: ProviderType;
}) => {
  const { connectors } = useInject();
  const providerTypes = useSuspense(connectors.getProviderTypes);
  const params: { key?: string } = useParams();

  // if subtypes available, render with subtypes
  if (
    providerTypes.find((provider: ProviderType) => provider.key === params?.key)?.subTypes?.length >
    0
  ) {
    return <ProviderLayoutSubType currentProviderType={currentProviderType} />;
  }

  return <ProviderLayoutDefault {...props} currentProviderType={currentProviderType} />;
};

const ProviderLayoutDefault = ({
  currentProviderType,
  currentSubType,
  ...props
}: {
  currentProviderType: ProviderType;
  currentSubType?: SubType;
}) => {
  const { activeFilters } = useFilters();

  const [connectedGroups, suggestedGroups] = useMemo(
    () =>
      partitionConnectedSuggested(
        currentSubType?.providerGroups ?? currentProviderType?.providerGroups
      ),
    [currentSubType, currentProviderType]
  );
  return (
    <CurrentProviderContainer {...props}>
      {connectedGroups.length > 0 && (
        <CurrentProviderGroupContainer>
          <CounterRowContainer>
            <SubHeading4>Connected</SubHeading4>
            <Counter>{connectedGroups.length} connectors</Counter>
          </CounterRowContainer>
          <ProviderCardTilesLayout
            currentProviderType={currentProviderType}
            currentSubType={currentSubType}
            providerGroups={connectedGroups}
          />
        </CurrentProviderGroupContainer>
      )}
      {suggestedGroups.length > 0 && (
        <CurrentProviderGroupContainer>
          <CounterRowContainer>
            <SubHeading4>Not Connected</SubHeading4>
            <Counter>{suggestedGroups.length} connectors</Counter>
          </CounterRowContainer>
          <ProviderCardTilesLayout
            currentProviderType={currentProviderType}
            currentSubType={currentSubType}
            providerGroups={suggestedGroups}
          />
        </CurrentProviderGroupContainer>
      )}
      {connectedGroups.length === 0 && suggestedGroups.length === 0 && (
        <ErrorLayoutNoResults activeFilters={activeFilters} />
      )}
    </CurrentProviderContainer>
  );
};

export function ProviderCardTilesLayout({
  currentProviderType,
  currentSubType,
  providerGroups,
  ...props
}: {
  currentProviderType?: ProviderType;
  currentSubType?: SubType;
  providerGroups: ProviderGroup[];
}) {
  const { subscription } = useInject();
  const sortedProviderGroups = [...providerGroups].sort(compareProviderGroups);

  return (
    <CardTiles {...props}>
      {sortedProviderGroups.map(provider => (
        <ConnectorCardFactory
          key={provider.key}
          provider={provider}
          section={currentProviderType?.key ?? ''}
          subSection={currentSubType?.subType ?? ''}
          limited={
            subscription.limitations.limitedConnectorGroups?.some(
              (connector: string) =>
                provider.types.hasOwnProperty(connectorsMapper[connector]) ?? false
            ) ?? false
          }
        />
      ))}
    </CardTiles>
  );
}

const ProviderLayoutSubType = ({
  currentProviderType,
  ...props
}: {
  currentProviderType: ProviderType;
}) => {
  const { subType } = useParams<{ subType: string }>();
  const { activeFilters } = useFilters();

  const defaultTab = useMemo(() => {
    const defaultSubType = currentProviderType?.subTypes.some(type => type.subType === subType)
      ? subType
      : currentProviderType?.subTypes?.[0]?.subType;
    return defaultSubType ?? null;
  }, [subType, currentProviderType]);

  const [selectedTab, setSelectedTab] = useState(defaultTab);

  const currentSubType =
    currentProviderType?.subTypes.find(
      (provider: ProviderGroup | ApiProviderGroup) => provider.subType === selectedTab
    ) ?? currentProviderType?.subTypes?.[0];

  const hasSubTypesGroups = currentSubType?.providerGroups?.length > 0;
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  useEffect(() => {
    setSelectedTab(defaultTab);
  }, [defaultTab]);

  return (
    <ProvidersContainer {...props}>
      <Tabs
        tabs={currentProviderType?.subTypes.map((provider: ProviderGroup | ApiProviderGroup) => ({
          key: provider.subType,
          label: provider.displayName,
          to: makeUrl(`/connectors/connect/${currentProviderType.key}/${provider.subType}`, {
            fl: activeFilters,
          }),
        }))}
        variant={Variant.SECONDARY}
        selected={selectedTab}
        onChange={handleTabChange}
      />
      {hasSubTypesGroups ? (
        <ProviderLayoutDefault
          currentProviderType={currentProviderType}
          currentSubType={currentSubType}
        />
      ) : (
        <ErrorLayoutNoResults activeFilters={activeFilters} />
      )}
    </ProvidersContainer>
  );
};

const CurrentProviderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6rem;
`;

const CurrentProviderGroupContainer = styled(CurrentProviderContainer)`
  gap: 3rem;
`;

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const ErrorLayoutNoResults = styled(({ activeFilters, ...props }) => {
  return (
    <ErrorLayout.NoResults {...props}>
      <NoResultsContainer>
        No results found
        <TextButton underline to={makeUrl('/connectors/connect', { fl: activeFilters })}>
          See in All Types <SvgIcon name="Arrow" size={Size.XXSMALL} />
        </TextButton>
      </NoResultsContainer>
    </ErrorLayout.NoResults>
  );
})``;
