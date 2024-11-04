import { InventoryApplicationsTable } from '@src-v2/containers/inventory-table/inventory-applications-table';
import { InventoryTabProps } from '@src-v2/containers/inventory/inventory-v2';

export function getApplicationsRouteDefinition({ profile }: InventoryTabProps) {
  return {
    title: 'Applications',
    path: 'application',
    render: () => <InventoryApplicationsTable repositoryKey={profile.key} />,
  };
}
