import { RouteDefinition } from '@src-v2/components/tabs/tabs-router';
import { ContributorsTableContainer } from '@src-v2/containers/inventory-table/contributors';
import { InventoryTabProps } from '@src-v2/containers/inventory/inventory-v2';

export function getContributorsRouteDefinition({
  profile,
  profileType,
  shouldShowPermissionColumn = false,
}: InventoryTabProps & {
  shouldShowPermissionColumn?: boolean;
}): RouteDefinition {
  return {
    title: 'Contributors',
    path: 'contributors',
    render: () => (
      <ContributorsTableContainer
        shouldShowPermissionColumn={shouldShowPermissionColumn}
        profileKey={profile.key}
        profileType={profileType}
      />
    ),
  };
}
