import { InventoryEntityTable } from '@src-v2/containers/inventory-table/inventory-item-table/inventory-entity-table';
import { InventoryTabProps, InventoryTabs } from '@src-v2/containers/inventory/inventory-v2';
import { EntityType } from '@src-v2/types/enums/entity-type';

export function getSupplyChainRouteDefinition({ profile, profileType }: InventoryTabProps) {
  return {
    title: 'Supply chain',
    path: 'supplyChain',
    render: () => (
      <InventoryTabs
        routes={[
          {
            title: 'Pipelines',
            path: 'pipelines',
            render: () => (
              <InventoryEntityTable
                profile={profile}
                profileType={profileType}
                entityType={EntityType.CicdPipelineDeclaration}
              />
            ),
          },
          {
            title: 'Pipeline dependencies',
            path: 'pipelineDependencies',
            render: () => (
              <InventoryEntityTable
                profile={profile}
                profileType={profileType}
                entityType={EntityType.PipelineDependencyDeclaration}
              />
            ),
          },
        ]}
      />
    ),
  };
}
