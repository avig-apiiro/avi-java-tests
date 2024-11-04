import { Connection } from '@src-v2/types/connector/connectors';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';

type SubTypes = {
  subType: string;
  displayName: string;
  providerGroups: ProviderGroup[];
};

export type ProviderType = {
  key: string;
  providerRouteUrl?: string;
  description: string;
  consumable?: string;
  title: string;
  consumableTitle?: string;
  monitorEnabled: boolean;
  editable: boolean;
  manageable: boolean;
  providerGroups: ProviderGroup[];
  subTypes?: SubTypes[];
  servers: Connection[];
};
