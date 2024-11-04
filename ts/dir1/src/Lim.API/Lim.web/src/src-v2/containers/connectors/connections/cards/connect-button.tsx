import { useCallback } from 'react';
import { Button } from '@src-v2/components/button-v2';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';

export const ConnectButton = ({ provider, onConnect }) => {
  const { connectors, rbac } = useInject();

  const handleConnect = useCallback(async () => {
    if (provider.isOAuthConnectionProvider || provider.isOAuthConnectionProviderForSaas) {
      await connectors.redirectToOAuthConsentUrl(provider.key.toLowerCase());
    } else {
      onConnect({ provider });
    }
  }, [onConnect, provider]);

  const multipleConnectionsAllowed =
    !provider.isOAuthConnectionProvider &&
    !provider.isOAuthConnectionProviderForSaas &&
    provider.displayName !== 'Perforce' &&
    provider.key !== 'NetworkBroker';

  const canConnect =
    rbac.canEdit(resourceTypes.Connectors) &&
    (multipleConnectionsAllowed || !provider.servers?.length);

  return (
    <Tooltip
      content={
        multipleConnectionsAllowed && provider.servers?.length > 1
          ? 'Only one workspace is supported'
          : 'You are not authorized to add connectors'
      }
      disabled={canConnect}>
      <Button
        size={Size.MEDIUM}
        disabled={!canConnect}
        variant={provider.connected ? Variant.TERTIARY : Variant.PRIMARY}
        onClick={handleConnect}>
        {provider.connected ? 'Add another' : 'Connect'}
      </Button>
    </Tooltip>
  );
};
