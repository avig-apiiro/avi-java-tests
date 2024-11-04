import { InventoryEntityTable } from '@src-v2/containers/inventory-table/inventory-item-table/inventory-entity-table';
import { InventoryTabProps, InventoryTabs } from '@src-v2/containers/inventory/inventory-v2';
import { EntityType } from '@src-v2/types/enums/entity-type';

export function getInfrastructureRouteDefinition(props: InventoryTabProps) {
  return {
    title: 'Infrastructure',
    path: 'infrastructure',
    render: () => <InventoryInfrastructureContent {...props} />,
  };
}

function InventoryInfrastructureContent({ profile, profileType }: InventoryTabProps) {
  return (
    <InventoryTabs
      routes={[
        {
          title: 'Terraform',
          path: 'terraformModules',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.TerraformModuleHighlights}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'Firewalls',
          path: 'firewalls',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.TerraformFirewallDeclaration}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'Docker',
          path: 'dockers',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.Dockerfile}
              profileType={profileType}
            />
          ),
        },
        {
          title: 'Kubernetes',
          path: 'kubernetes',
          render: () => <KubernetesTabs profile={profile} profileType={profileType} />,
        },
      ]}
    />
  );
}

function KubernetesTabs({ profile, profileType }: InventoryTabProps) {
  return (
    <InventoryTabs
      routes={[
        {
          title: `Deployments`,
          path: 'deployments',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.KubernetesDeployment}
              profileType={profileType}
            />
          ),
        },
        {
          title: `Services`,
          path: 'services',
          render: () => (
            <InventoryEntityTable
              profile={profile}
              entityType={EntityType.KubernetesService}
              profileType={profileType}
              hideExport={true}
            />
          ),
        },
      ]}
    />
  );
}
