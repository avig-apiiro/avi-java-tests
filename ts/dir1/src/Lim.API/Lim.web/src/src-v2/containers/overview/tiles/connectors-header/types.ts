import { ProviderGroupType } from '@src-v2/types/enums/provider-group-type';

export const ITConnectorTypes = [
  ProviderGroupType.TicketingSystems,
  ProviderGroupType.SourceCode,
  ProviderGroupType.SecurityScanners,
  ProviderGroupType.CiCd,
  ProviderGroupType.Registries,
  ProviderGroupType.Runtime,
  ProviderGroupType.Communication,
  ProviderGroupType.Identity,
  ProviderGroupType.Training,
  ProviderGroupType.SIEM,
];

export const providerGroupTypeToLabel: { [p in keyof typeof ProviderGroupType]: string } = {
  SourceCode: 'Source control',
  TicketingSystems: null,
  Communication: 'Communication tools',
  CiCd: 'CI/CD',
  SecurityScanners: 'Security tools',
  ApiGateways: 'API gateways',
  Cloud: 'K8s clusters',
  Registries: null,
  Training: null,
  Identity: 'Identity management',
  SIEM: 'SIEM Tools',
  Runtime: 'Runtime',
};

export const ExpandableProviderGroupTypes = {
  SecurityScanners: ProviderGroupType.SecurityScanners,
  Runtime: ProviderGroupType.Runtime,
} as const;
