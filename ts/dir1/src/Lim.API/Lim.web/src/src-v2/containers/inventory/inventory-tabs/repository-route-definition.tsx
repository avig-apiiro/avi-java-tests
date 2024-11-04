import { InventoryRepositoriesTable } from '@src-v2/containers/inventory-table/inventory-repositories-table';
import { InventoryTabProps } from '@src-v2/containers/inventory/inventory-v2';

export function getRepositoryRouteDefinition({ profile }: InventoryTabProps) {
  return {
    title: 'Repositories',
    path: 'repositories',
    render: () => <InventoryRepositoriesTable applicationKey={profile.key} />,
  };
}
