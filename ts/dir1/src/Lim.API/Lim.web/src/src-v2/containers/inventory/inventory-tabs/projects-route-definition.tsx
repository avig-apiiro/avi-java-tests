import { InventoryApplicationProjectTable } from '@src-v2/containers/inventory-table/inventory-application-projects-table';
import { InventoryRepositoryProjectTable } from '@src-v2/containers/inventory-table/inventory-repository-projects-table';
import { InventoryTabProps } from '@src-v2/containers/inventory/inventory-v2';
import { ProfileType } from '@src-v2/types/enums/profile-type';

export function getProjectsRouteDefinition({ profile: { key }, profileType }: InventoryTabProps) {
  return {
    title: 'Projects',
    path: 'projects',
    render: () =>
      profileType === ProfileType.Repository ? (
        <InventoryRepositoryProjectTable repositoryKey={key} />
      ) : (
        <InventoryApplicationProjectTable applicationKey={key} />
      ),
  };
}
