import { DeployKeysTable } from '@src-v2/containers/inventory-table/custom-tables/deploy-keys-table';
import { InventoryEntityTable } from '@src-v2/containers/inventory-table/inventory-item-table/inventory-entity-table';
import { useSecretsExclusionDefinitionEnricher } from '@src-v2/containers/inventory-table/inventory-item-table/table-enrichers';
import { InventoryTabProps, InventoryTabs } from '@src-v2/containers/inventory/inventory-v2';
import { useInject } from '@src-v2/hooks';
import { EntityType } from '@src-v2/types/enums/entity-type';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function getDataRouteDefinition(props: InventoryTabProps) {
  return {
    title: 'Data',
    path: 'data',
    render: () => <InventoryDataContent {...props} />,
  };
}

function InventoryDataContent({ profile, profileType }: InventoryTabProps) {
  const { application } = useInject();

  return (
    <InventoryTabs
      routes={[
        {
          title: 'Data Models',
          path: 'dataModels',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.DataModel}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'GraphQL Objects',
          path: 'graphqlObjects',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.GqlObject}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'Protobuf Message',
          path: 'protobufMessages',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.ProtobufMessage}
              profileType={profileType}
              hideExport={true}
            />
          ),
        },
        {
          title: 'Data Access Objects',
          path: 'dataAccessObjects',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.DataAccessObject}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'Sensitive Data',
          path: 'sensitiveData',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.SensitiveData}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'Secrets',
          path: 'secrets',
          render: () => <InventorySecretsTable profile={profile} profileType={profileType} />,
        },
        {
          title: 'Deploy Keys',
          path: 'deployKeys',
          condition: application.isFeatureEnabled(FeatureFlag.DeployKeys),
          render: () => <DeployKeysTable profile={profile} />,
        },
      ]}
    />
  );
}

const InventorySecretsTable = (props: InventoryTabProps) => (
  <InventoryEntityTable
    {...props}
    entityType={EntityType.Secret}
    enrichPage={useSecretsExclusionDefinitionEnricher()}
  />
);
