import { InventoryEntityTable } from '@src-v2/containers/inventory-table/inventory-item-table/inventory-entity-table';
import { InventoryTabProps, InventoryTabs } from '@src-v2/containers/inventory/inventory-v2';
import { EntityType } from '@src-v2/types/enums/entity-type';

export function getControlsRouteDefinition(props: InventoryTabProps) {
  return {
    title: 'Controls',
    path: 'controls',
    render: () => <InventoryControlsContent {...props} />,
  };
}

function InventoryControlsContent({ profile, profileType }: InventoryTabProps) {
  return (
    <InventoryTabs
      routes={[
        {
          title: 'Spring Security',
          path: 'springSecurity',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.SecurityConfiguration}
              profileType={profileType}
              hideExport={true}
            />
          ),
        },
        {
          title: 'Role-Based Authorization',
          path: 'roles',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.RbacRole}
              profileType={profileType}
            />
          ),
        },
        {
          title: `Encryption Usages`,
          path: 'encryption',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.EncryptionUsage}
              profileType={profileType}
            />
          ),
        },
      ]}
    />
  );
}
