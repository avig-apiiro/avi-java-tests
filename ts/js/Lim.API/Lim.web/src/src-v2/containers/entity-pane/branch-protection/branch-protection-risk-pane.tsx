import { useCallback } from 'react';
import { RiskPane, RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { RiskPaneHeader } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskPaneTabsRouter } from '@src-v2/components/entity-pane/risk-pane/risk-pane-tabs-router';
import { AboutThisBranchProtectionCard } from '@src-v2/containers/entity-pane/branch-protection/about-this-branch-protection-card';
import { FixBranchProtectionCard } from '@src-v2/containers/entity-pane/branch-protection/fix-branch-protection-card';
import { useInject } from '@src-v2/hooks';

export function BranchProtectionRiskPane(props: RiskPaneProps) {
  const { inventory } = useInject();
  const fetchInventory = useCallback(
    ({ risk }) =>
      inventory.getBranchProtectionElement(
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
        evidence={AboutThisBranchProtectionCard}
        remediate={FixBranchProtectionCard}
        codeOwnerIsRepoAdmin={true}
      />
    </RiskPane>
  );
}
