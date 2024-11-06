import { Provider } from '@src-v2/types/enums/provider';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { ApiSecurityControl } from '@src-v2/types/inventory-elements/api/api-security-control';

export interface ApiGatewaySummary {
  displayName: string;
  gatewayUrl: string;
  provider: keyof typeof Provider;
  providerGroup?: keyof typeof ProviderGroup;
  exposureTime: Date;
  apiOperations: { id: string; name: string; method: string; urls: string[] }[];
  serviceEndpointUrls: string[];
  listenPath: string;
  listenPort: string;
  forwardPath: string;
  forwardUrl: string;
  apiSecurityControls: ApiSecurityControl[];
}
