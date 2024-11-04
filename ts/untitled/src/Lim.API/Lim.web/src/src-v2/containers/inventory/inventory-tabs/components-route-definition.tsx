import { TechnologyUsagesTable } from '@src-v2/containers/inventory-table/custom-tables/technologies-table';
import { InventoryEntityTable } from '@src-v2/containers/inventory-table/inventory-item-table/inventory-entity-table';
import { InventoryModulesTable } from '@src-v2/containers/inventory-table/inventory-modules-table';
import { InventoryTabProps, InventoryTabs } from '@src-v2/containers/inventory/inventory-v2';
import { useInject } from '@src-v2/hooks';
import { EntityType } from '@src-v2/types/enums/entity-type';

export function getComponentsRouteDefinition(props: InventoryTabProps) {
  return {
    title: 'Components',
    path: 'components',
    render: () => <InventoryComponentsContent {...props} />,
  };
}

function InventoryComponentsContent({ profile, profileType }: InventoryTabProps) {
  const { application } = useInject();

  return (
    <InventoryTabs
      noAnimation
      routes={[
        {
          title: 'Modules',
          path: 'modules',
          render: () => <InventoryModulesTable profile={profile} modules={profile.modules} />,
        },
        {
          title: 'APIs',
          path: 'apis',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.Api}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'GraphQL Operations',
          path: 'graphqlOperations',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.Gql}
              profileType={profileType}
              hideExport={true}
            />
          ),
        },
        {
          title: `Protobuf Services`,
          path: 'protobufServices',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.ProtobufService}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'Technologies',
          path: 'technologies',
          render: () => <TechnologyUsagesTable profile={profile} profileType={profileType} />,
        },
        {
          title: 'Dependencies',
          path: 'dependencies',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.Dependency}
              profileType={profileType}
            />
          ),
        },
        {
          title: `Licenses`,
          path: 'licenses',
          condition: application.externalConnectivity,
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.LicenseWithDependencies}
              profileType={profileType}
            />
          ),
        },
        {
          title: `Serverless`,
          path: 'serverless',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.ServerlessFunction}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'Storage Bucket Interactions',
          path: 'storageBucketInteractions',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.EnrichedStorageBucketMethod}
              profileType={profileType}
              hideExport={true}
            />
          ),
        },
      ]}
    />
  );
}
