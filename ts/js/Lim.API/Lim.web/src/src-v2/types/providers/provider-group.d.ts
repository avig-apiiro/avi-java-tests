import { Connection } from '@src-v2/types/connector/connectors';
import { ProviderVisibilityStatus } from '@src-v2/types/enums/provider-visibility-status';
import { ProviderGroupBase } from '@src-v2/types/providers/provider-group-base';

export type ProviderGroup = ProviderGroupBase & {
  iconName?: string;
  displayName?: string;
  fixedUrl?: string;
  betaFeatureName?: string;
  enableOnlyExternalUrl?: string;
  docsUrl?: string;
  supportsPrivateKey: boolean;
  usernameNotRequired: boolean;
  demoOnly: boolean;
  cloudOnly: boolean;
  premiseOnly: boolean;
  tokenAsPasswordNotSupported: boolean;
  isOAuthConnectionProvider: boolean;
  isOAuthConnectionProviderForSaas: boolean;
  editable: boolean;
  supportedResources: string[];
  servers: Connection[];
  connected: boolean;
  faultedCount: number;
  faulted: boolean;
  defaultUrl?: string;
  allowMultipleConnectorsUrl?: boolean;
  visibilityStatus?: ProviderVisibilityStatus;
  visibilityStatusBySubType?: Record<string, ProviderVisibilityStatus>;
  managedByApiiro?: boolean;
};
