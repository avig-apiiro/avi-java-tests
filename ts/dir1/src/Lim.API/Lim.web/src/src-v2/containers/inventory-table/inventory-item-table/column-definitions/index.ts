import { apiElementColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/api-element-columns';
import { dataAccessObjectColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/data-access-object-columns';
import { dataModelColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/data-model-columns';
import { dependencyDeclarationColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/dependency-declaration-columns';
import { createDockerfileColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/dockerfile-columns';
import { createEncryptionUsageColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/encryption-usage-columns';
import { enrichedStorageBucketMethodColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/enriched-storage-bucket-method-columns';
import { gqlObjectColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/gql-object-columns';
import { gqlOperationColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/gql-operation-columns';
import { kubernetesDeploymentColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/kubernetes-deployment-columns';
import { kubernetesServiceColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/kubernetes-service-columns';
import { licenseWithDependenciesColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/license-with-dependencies-columns';
import { pipelineConfigurationFileColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/pipeline-configuration-file-columns';
import { pipelineDependencyDeclarationsColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/pipeline-dependency-declarations-columns';
import { protobufMessageColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/protobuf-message-columns';
import { protobufServiceColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/protobuf-service-columns';
import { createRbacRoleColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/rbac-role-columns';
import { riskyIssueColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/risky-issue-columns';
import { secretColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/secret-columns';
import { securityConfigurationColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/security-configuration-columns';
import { sensitiveDataColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/sensitive-data-columns';
import { serverlessFunctionColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/serverless-function-columns';
import { terraformFirewallDeclarationColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/terraform-firewall-declaration-columns';
import { terraformModuleHighlightsColumns } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/terraform-module-highlights-columns';
import { EntityType } from '@src-v2/types/enums/entity-type';

export const columnDefinitions: { [key in EntityType]: any[] | ((profile: any) => any[]) } = {
  [EntityType.EncryptionUsage]: createEncryptionUsageColumns,
  [EntityType.None]: [],
  [EntityType.Unknown]: [],
  [EntityType.Api]: apiElementColumns,
  [EntityType.FrameworkUsage]: [],
  [EntityType.CodeFinding]: [],
  [EntityType.DataAccessObject]: dataAccessObjectColumns,
  [EntityType.DataModel]: dataModelColumns,
  [EntityType.Dependency]: dependencyDeclarationColumns,
  [EntityType.Dockerfile]: createDockerfileColumns,
  [EntityType.DeployKey]: [],
  [EntityType.EnrichedStorageBucketMethod]: enrichedStorageBucketMethodColumns,
  [EntityType.Gql]: gqlOperationColumns,
  [EntityType.GqlObject]: gqlObjectColumns,
  [EntityType.Issue]: riskyIssueColumns,
  [EntityType.Modules]: [],
  [EntityType.JavaAnnotations]: [],
  [EntityType.KubernetesDeployment]: kubernetesDeploymentColumns,
  [EntityType.KubernetesService]: kubernetesServiceColumns,
  [EntityType.LicenseWithDependencies]: licenseWithDependenciesColumns,
  [EntityType.ProtobufSchema]: [],
  [EntityType.ProtobufMessage]: protobufMessageColumns,
  [EntityType.ProtobufService]: protobufServiceColumns,
  [EntityType.CicdPipelineDeclaration]: pipelineConfigurationFileColumns,
  [EntityType.PipelineConfigurationFile]: [],
  [EntityType.PipelineDependencyDeclaration]: pipelineDependencyDeclarationsColumns,
  [EntityType.RbacRole]: createRbacRoleColumns,
  [EntityType.SecurityConfiguration]: securityConfigurationColumns,
  [EntityType.Secret]: secretColumns,
  [EntityType.SensitiveData]: sensitiveDataColumns,
  [EntityType.SensitiveFile]: [],
  [EntityType.ServerlessFunction]: serverlessFunctionColumns,
  [EntityType.ServiceCatalog]: [],
  [EntityType.TerraformModuleHighlights]: terraformModuleHighlightsColumns,
  [EntityType.TerraformResource]: [],
  [EntityType.TerraformFirewallDeclaration]: terraformFirewallDeclarationColumns,
};
