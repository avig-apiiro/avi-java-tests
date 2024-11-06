export enum RiskCategory {
  General,
  EntryPoints = 'Entry Point Changes',

  Secrets = 'Secrets',

  License = 'OSS Licenses',

  SensitiveData = 'Sensitive Data',

  OSS = 'OSS Security',

  DataModel = 'Data Model Changes',

  AccessControl = 'Access Control',

  Infrastructure = 'Infrastructure Changes',

  SAST = 'SAST Findings',

  SensitiveFile = 'Sensitive File Changes',

  Activity = 'Abnormal Activity',

  Technology = 'Technology Usage',

  Issues = 'Tracked Issues',

  Design = 'Design',

  CICD = 'CI/CD Security',

  BranchProtection = 'Branch Protection',

  PipelineMisconfigurations = 'Pipeline Misconfigurations',

  Permissions = 'Permissions',

  Runtime = 'Runtime Findings',

  PipelineDependencies = 'Pipeline Dependencies',

  CloudSecurity = 'Cloud Security',

  BugBounty = 'Bug Bounty',

  ContainerSecurity = 'Container Security',

  ThreatModeling = 'Threat Modeling',

  HostSecurity = 'Host Security',
}
