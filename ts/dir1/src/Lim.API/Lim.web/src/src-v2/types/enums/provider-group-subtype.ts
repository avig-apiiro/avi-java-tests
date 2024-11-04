export const SubtypeByProviderGroup = {
  SecurityScanners: {
    SCA: 'SCA',
    SAST: 'SAST',
    Secrets: 'Secrets',
    ApiSecurity: 'ApiSecurity',
    DAST: 'DAST',
    CloudSecurity: 'CloudSecurity',
    ContainerSecurity: 'ContainerSecurity',
    BugBounty: 'BugBounty',
    ThreatModeling: 'ThreatModeling',
    HostSecurity: 'HostSecurity',
  },
  Runtime: {
    KubernetesClusters: 'KubernetesClusters',
    ApiGateways: 'ApiGateways',
  },
} as const;
