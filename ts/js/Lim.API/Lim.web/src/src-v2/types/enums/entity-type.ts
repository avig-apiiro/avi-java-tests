export enum EntityType {
  None = 'ElementMissing',
  Unknown = 'Unknown',
  Api = 'ApiElement',
  FrameworkUsage = 'FrameworkUsage',
  EncryptionUsage = 'EncryptionUsage',
  DataAccessObject = 'DataAccessObject',
  DataModel = 'DataModel',
  Dependency = 'DependencyDeclaration',
  Dockerfile = 'Dockerfile',
  DeployKey = 'DeployKey',
  EnrichedStorageBucketMethod = 'EnrichedStorageBucketMethod',
  CodeFinding = 'CodeFinding',
  Gql = 'GqlOperation',
  GqlObject = 'GqlObject',
  Issue = 'TrackedIssue',
  Modules = 'Modules',
  JavaAnnotations = 'JavaAnnotations',
  KubernetesDeployment = 'KubernetesDeployment',
  KubernetesService = 'KubernetesService',
  LicenseWithDependencies = 'LicenseWithDependencies',
  ProtobufSchema = 'ProtobufSchema',
  ProtobufMessage = 'ProtobufMessage',
  ProtobufService = 'ProtobufService',
  PipelineConfigurationFile = 'PipelineConfigurationFile',
  CicdPipelineDeclaration = 'CicdPipelineDeclaration',
  PipelineDependencyDeclaration = 'PipelineDependencyDeclaration',
  RbacRole = 'RbacRole',
  SecurityConfiguration = 'SecurityConfiguration',
  Secret = 'Secret',
  SensitiveData = 'SensitiveData',
  SensitiveFile = 'SensitiveFile',
  ServerlessFunction = 'ServerlessFunction',
  ServiceCatalog = 'ServiceCatalog',
  TerraformModuleHighlights = 'TerraformModuleHighlights',
  TerraformResource = 'TerraformResource',
  TerraformFirewallDeclaration = 'TerraformFirewallDeclaration',
}
