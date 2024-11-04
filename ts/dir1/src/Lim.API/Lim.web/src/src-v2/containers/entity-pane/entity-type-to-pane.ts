import { FC } from 'react';
import { PaneProps } from '@src-v2/components/panes/pane';
import { ApiEntityPane } from '@src-v2/containers/entity-pane/api/api-entity-pane';
import { DataAccessObjectEntityPane } from '@src-v2/containers/entity-pane/data-access-object/data-access-object-entity-pane';
import { DataModelEntityPane } from '@src-v2/containers/entity-pane/data-model/data-model-entity-pane';
import { DockerFileEntityPane } from '@src-v2/containers/entity-pane/docker-file/docker-file-entity-pane';
import { FrameworkUsageEntityPane } from '@src-v2/containers/entity-pane/framework-usage/framework-usage-entity-pane';
import { GraphQlEntityPane } from '@src-v2/containers/entity-pane/graph-ql/graph-ql-entity-pane';
import { KubernetesDeploymentEntityPane } from '@src-v2/containers/entity-pane/kubernetes-deployment/kubernetes-deployment-entity-pane';
import { KubernetesServiceEntityPane } from '@src-v2/containers/entity-pane/kubernetes-service/kubernetes-service-entity-pane';
import { LicenseEntityPane } from '@src-v2/containers/entity-pane/licenses/license-entity-pane';
import { PipelineEntityPane } from '@src-v2/containers/entity-pane/pipeline-configuration-file/pipeline-entity-pane';
import { PipelineDependencyPane } from '@src-v2/containers/entity-pane/pipeline-dependencies/pipeline-dependency-pane';
import { ProtobufSchemaEntityPane } from '@src-v2/containers/entity-pane/protobuf-schema/protobuf-schema-entity-pane';
import { DependencyEntityPane } from '@src-v2/containers/entity-pane/sca/dependency-entity-pane';
import { SecretsEntityPane } from '@src-v2/containers/entity-pane/secrets/secrets-entity-pane';
import { SensitiveDataEntityPane } from '@src-v2/containers/entity-pane/sensitive-data/sensitive-data-entity-pane';
import { ServerlessFunctionEntityPane } from '@src-v2/containers/entity-pane/serverless-function/serverless-function-entity-pane';
import { CodeFindingPane } from '@src-v2/containers/finding-pane/code-finding-pane';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { EntityType } from '@src-v2/types/enums/entity-type';

export const entityTypeToPane: {
  [key in EntityType]: FC<
    {
      dataModelReference: DiffableEntityDataModelReference;
    } & PaneProps
  >;
} = {
  [EntityType.None]: undefined,
  [EntityType.Unknown]: undefined,
  [EntityType.Api]: ApiEntityPane,
  [EntityType.DataAccessObject]: DataAccessObjectEntityPane,
  [EntityType.DataModel]: DataModelEntityPane,
  [EntityType.Dependency]: DependencyEntityPane,
  [EntityType.Dockerfile]: DockerFileEntityPane,
  [EntityType.DeployKey]: undefined,
  [EntityType.EncryptionUsage]: undefined,
  [EntityType.EnrichedStorageBucketMethod]: undefined,
  [EntityType.CodeFinding]: CodeFindingPane,
  [EntityType.FrameworkUsage]: FrameworkUsageEntityPane,
  [EntityType.Gql]: GraphQlEntityPane,
  [EntityType.GqlObject]: GraphQlEntityPane,
  [EntityType.Issue]: undefined,
  [EntityType.JavaAnnotations]: undefined,
  [EntityType.KubernetesDeployment]: KubernetesDeploymentEntityPane,
  [EntityType.KubernetesService]: KubernetesServiceEntityPane,
  [EntityType.LicenseWithDependencies]: LicenseEntityPane,
  [EntityType.Modules]: undefined,
  [EntityType.ProtobufSchema]: ProtobufSchemaEntityPane,
  [EntityType.ProtobufMessage]: ProtobufSchemaEntityPane,
  [EntityType.ProtobufService]: ProtobufSchemaEntityPane,
  [EntityType.PipelineConfigurationFile]: PipelineEntityPane,
  [EntityType.CicdPipelineDeclaration]: PipelineEntityPane,
  [EntityType.PipelineDependencyDeclaration]: PipelineDependencyPane,
  [EntityType.RbacRole]: undefined,
  [EntityType.SecurityConfiguration]: undefined,
  [EntityType.Secret]: SecretsEntityPane,
  [EntityType.SensitiveData]: SensitiveDataEntityPane,
  [EntityType.SensitiveFile]: undefined,
  [EntityType.ServerlessFunction]: ServerlessFunctionEntityPane,
  [EntityType.ServiceCatalog]: undefined,
  [EntityType.TerraformModuleHighlights]: undefined,
  [EntityType.TerraformResource]: undefined,
  [EntityType.TerraformFirewallDeclaration]: undefined,
};
