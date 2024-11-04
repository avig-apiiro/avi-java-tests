import { InventoryTeamApplicationsTable } from '@src-v2/containers/inventory-table/inventory-team-applications-table';
import { InventoryTabProps } from '@src-v2/containers/inventory/inventory-v2';

export function getTeamApplicationsRouteDefinition({ profile }: InventoryTabProps) {
  return {
    title: 'Applications',
    path: 'application',
    render: () => <InventoryTeamApplicationsTable teamKey={profile.key} />,
  };
}
