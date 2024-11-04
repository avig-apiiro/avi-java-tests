import { Connection } from '@src-v2/types/connector/connectors';
import { ProviderGroup as ProviderGroupEnum } from '@src-v2/types/enums/provider-group';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';

export const isNonFunctionalServers = (servers: Connection[]) =>
  servers?.length > 0 &&
  servers.every(
    server =>
      server.tokenDaysToExpire === 0 ||
      server.activeActionableErrors?.[0]?.errorDetails?.errorCategory === 'Authentication' ||
      (server.providerGroup === ProviderGroupEnum.NetworkBroker && !server.isReachable)
  );

export function compareProviderGroups(provider: ProviderGroup, secondProvider: ProviderGroup) {
  const allFirstNonFunctional = isNonFunctionalServers(provider.servers);
  const allSecondNonFunctional = isNonFunctionalServers(secondProvider.servers);

  // order providers with errors
  if (allFirstNonFunctional) {
    return -1;
  }
  if (allSecondNonFunctional) {
    return 1;
  }

  // order providers with warnings
  if (provider.faultedCount > 0) {
    return -1;
  }
  if (secondProvider.faultedCount > 0) {
    return 1;
  }

  return 0;
}
