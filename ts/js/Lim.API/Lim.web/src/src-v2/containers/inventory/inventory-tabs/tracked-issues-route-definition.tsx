import { RouteDefinition } from '@src-v2/components/tabs/tabs-router';
import { InventoryEntityTable } from '@src-v2/containers/inventory-table/inventory-item-table/inventory-entity-table';
import { useRiskIssuesEnricher } from '@src-v2/containers/inventory-table/inventory-item-table/table-enrichers';
import { InventoryTabProps } from '@src-v2/containers/inventory/inventory-v2';
import { EntityType } from '@src-v2/types/enums/entity-type';

export function getTrackedIssuesRouteDefinition(props: InventoryTabProps): RouteDefinition {
  return {
    title: 'Tracked issues',
    path: 'trackedIssues',
    render: () => <TrackedIssuesContent {...props} />,
  };
}

function TrackedIssuesContent({ profile, profileType }: InventoryTabProps) {
  const enrichIssuesAssignees = useRiskIssuesEnricher();

  return (
    <InventoryEntityTable
      profile={profile}
      entityType={EntityType.Issue}
      profileType={profileType}
      enrichPage={enrichIssuesAssignees}
      hideExport={true}
    />
  );
}
