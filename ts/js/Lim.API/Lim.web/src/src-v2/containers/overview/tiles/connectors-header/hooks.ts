import { useMemo } from 'react';
import { partitionConnectedSuggested } from '@src-v2/containers/connectors/connections/catalog/connectors-catalog';
import { useConnectors } from '@src-v2/containers/connectors/connections/catalog/use-connectors';
import { ITConnectorTypes } from '@src-v2/containers/overview/tiles/connectors-header/types';
import { SubtypeByProviderGroup } from '@src-v2/types/enums/provider-group-subtype';
import { ProviderGroupType } from '@src-v2/types/enums/provider-group-type';
import { ProviderVisibilityStatus } from '@src-v2/types/enums/provider-visibility-status';
import { SDLCInfoResult } from '@src-v2/types/overview/overview-responses';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { entries } from '@src-v2/utils/ts-utils';

export const useCombinedConnectors = () => {
  const { filteredFlatAllProviderGroups } = useConnectors();

  const [connectedProviderGroups] = useMemo(() => {
    return partitionConnectedSuggested(filteredFlatAllProviderGroups);
  }, [filteredFlatAllProviderGroups]);

  const initialVendorsByType: Record<ProviderGroupType, SDLCInfoResult> = ITConnectorTypes.reduce(
    (acc, type) => {
      acc[type] = {
        type,
        vendors: [],
        count: 0,
        hasConnections: false,
      };
      return acc;
    },
    {} as Record<ProviderGroupType, SDLCInfoResult>
  );

  const vendorsByType = connectedProviderGroups.reduce((acc, providerGroup) => {
    Object.keys(providerGroup.types).forEach((type: ProviderGroupType) => {
      if (ITConnectorTypes.includes(type)) {
        if (!acc[type]) {
          acc[type] = {
            type,
            vendors: [],
            count: 0,
            hasConnections: false,
          };
        }
        acc[type].vendors.push(providerGroup);
        acc[type].count += 1;
        acc[type].hasConnections = true;
      }
    });
    return acc;
  }, initialVendorsByType);

  const formattedVendors = Object.values(vendorsByType) as SDLCInfoResult[];

  const SDLCConnectors = {
    Design: formattedVendors.filter(vendor => vendor.type === ProviderGroupType.TicketingSystems),
    Development: formattedVendors.filter(vendor =>
      [ProviderGroupType.SourceCode, ProviderGroupType.SecurityScanners].includes(
        vendor.type as ProviderGroupType
      )
    ),
    Build: formattedVendors.filter(vendor => vendor.type === ProviderGroupType.CiCd),
    Deployment: formattedVendors.filter(vendor =>
      [ProviderGroupType.Registries, ProviderGroupType.Runtime].includes(
        vendor.type as ProviderGroupType
      )
    ),
  } as Record<string, SDLCInfoResult[]>;

  const ITConnectors = {
    'IT Systems': formattedVendors.filter(vendor =>
      [
        ProviderGroupType.Communication,
        ProviderGroupType.Identity,
        ProviderGroupType.Training,
        ProviderGroupType.SIEM,
      ].includes(vendor.type as ProviderGroupType)
    ),
  };

  return {
    sdlcConnectorsEntries: entries(SDLCConnectors),
    itConnectorsEntries: entries(ITConnectors),
  };
};

export const useCategorizedVendors = (item, providerTypes) => {
  return useMemo(() => {
    const categorized = {};

    // Initialize categorized with all subtypes
    providerTypes.forEach(providerType => {
      if (providerType.key === item.type) {
        const subTypeOrder = Object.values(SubtypeByProviderGroup[providerType.key]) || [];
        subTypeOrder.forEach((subType: string) => {
          categorized[subType] = [];
        });
      }
    });

    providerTypes.forEach(providerType => {
      if (providerType.key === item.type) {
        providerType.providerGroups.forEach(group => {
          const subTypes = group.types[item.type] || [];

          subTypes.forEach(subTypeData => {
            const addedGroups = new Set<string>();

            item.vendors.forEach((vendor: ProviderGroup) => {
              if (
                vendor.key.toLowerCase().includes(group.key.toLowerCase()) &&
                !addedGroups.has(group.key) &&
                vendor.visibilityStatus !== ProviderVisibilityStatus.ComingSoon &&
                vendor.visibilityStatusBySubType[subTypeData.subType] !==
                  ProviderVisibilityStatus.ComingSoon
              ) {
                categorized[subTypeData.subType].push(vendor);
                addedGroups.add(group.key);
              }
            });
          });
        });
      }
    });

    const sortedCategorized = {};
    providerTypes.forEach(providerType => {
      if (providerType.key === item.type) {
        const subTypeOrder = Object.values(SubtypeByProviderGroup[providerType.key]) || [];
        subTypeOrder.forEach((subType: string) => {
          sortedCategorized[subType] = categorized[subType] || [];
        });
      }
    });

    return sortedCategorized;
  }, [item.vendors, providerTypes, item.type]);
};
