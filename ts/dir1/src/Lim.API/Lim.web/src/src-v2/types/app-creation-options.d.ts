import { ProviderGroup } from '@src-v2/types/enums/provider-group';

type ConfigurationAssetOption = {
  branchName: string;
  groupKey: string;
  isMonitored: boolean;
  key: string;
  name: string;
  providerGroup: ProviderGroup;
  serverUrl: string;
  type: string;
};

type DescriptionOption = { value: string; label: string };

export type AppCreationOptions = {
  apiGateways: ConfigurationAssetOption[];
  apiGatewaysRoutes: ConfigurationAssetOption[];
  applicationTypesOptions: DescriptionOption[];
  deploymentLocationOptions: DescriptionOption[];
  complianceRequirementsOptions: DescriptionOption[];
  estimatedUsersNumberOptions: DescriptionOption[];
  estimatedRevenueOptions: DescriptionOption[];
};
