import { useCallback } from 'react';
import { RiskPane, RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { RiskPaneHeader } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskPaneTabsRouter } from '@src-v2/components/entity-pane/risk-pane/risk-pane-tabs-router';
import { AboutThisAdminCard } from '@src-v2/containers/entity-pane/inactive-user/main-tab/about-this-admin-card';
import { FixInactiveAdminCard } from '@src-v2/containers/entity-pane/inactive-user/remediation/fix-inactive-admin-card';
import { useInject } from '@src-v2/hooks';

export function InactiveAdminRiskPane(props: RiskPaneProps) {
  const { inventory } = useInject();
  const fetchInventory = useCallback(
    ({ risk }) =>
      inventory.getInactiveRepositoryAdminElement(
        risk.primaryDataModelReference
          ? {
              reference: risk.primaryDataModelReference,
            }
          : {
              profileKey: risk.relatedEntity.key,
              elementKey: risk.elementKey,
              profileType: risk.profile.profileType,
              elementType: risk.elementType,
            }
      ),
    [inventory]
  );

  return (
    <RiskPane {...props} header={<RiskPaneHeader />} elementDataFetcher={fetchInventory}>
      <RiskPaneTabsRouter
        evidence={AboutThisAdminCard}
        remediate={FixInactiveAdminCard}
        codeOwnerIsRepoAdmin={true}
      />
    </RiskPane>
  );
}
