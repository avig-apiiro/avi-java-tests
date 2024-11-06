import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SubType } from '@src-v2/containers/connectors/connections/catalog/connectors-provider-layouts';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { ApiProviderGroup } from '@src-v2/types/providers/api-provider-group';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { ProviderType } from '@src-v2/types/providers/provider-type';

export function useConnectors() {
  const { connectors } = useInject();
  const { activeFilters } = useFilters();
  const providerTypes = useSuspense(connectors.getProviderTypes);
  const params: { key?: string } = useParams();
  const [currentProviderType, setCurrentProviderType] = useState(
    params?.key ? providerTypes.find(provider => provider.key === params.key) : null
  );

  const filteredProviderTypes = useMemo<
    (ProviderType & { providerGroups: (ProviderGroup | ApiProviderGroup)[] })[]
  >(() => {
    if (activeFilters.searchTerm) {
      return providerTypes.map(({ providerGroups, subTypes, ...providerType }) => ({
        ...providerType,
        providerGroups: providerGroups?.filter((group: ProviderGroup | ApiProviderGroup) => {
          return (group.displayName ?? group.key)
            .toLowerCase()
            .includes(activeFilters.searchTerm.toString().toLowerCase());
        }),
        subTypes: subTypes?.map((subType: SubType) => ({
          ...subType,
          providerGroups: subType.providerGroups.filter(
            (group: ProviderGroup | ApiProviderGroup) => {
              return (group.displayName ?? group.key)
                .toLowerCase()
                .includes(activeFilters.searchTerm.toString().toLowerCase());
            }
          ),
        })),
      }));
    }
    return providerTypes;
  }, [providerTypes, activeFilters.searchTerm]);

  // create flat providerGroups for 'All type' screen
  const filteredFlatAllProviderGroups = useMemo(() => {
    const flatProviderGroups = filteredProviderTypes.flatMap(provider => provider.providerGroups);

    // remove duplications of providers
    return flatProviderGroups.reduce((result: ProviderType[], provider: ProviderType) => {
      if (result.some(item => item.key === provider.key)) {
        return result;
      }
      return [...result, provider];
    }, []);
  }, [filteredProviderTypes]);

  useEffect(() => {
    if (params?.key) {
      const customProviderType = filteredProviderTypes.find(
        provider => provider.key?.toLowerCase() === params.key?.toLowerCase()
      );
      setCurrentProviderType(customProviderType);
    } else {
      setCurrentProviderType(null);
    }
  }, [params, filteredProviderTypes]);

  return {
    currentProviderType,
    setCurrentProviderType,
    filteredFlatAllProviderGroups,
  };
}
