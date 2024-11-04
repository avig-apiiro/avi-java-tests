import { useCallback } from 'react';
import { RiskPane, RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { RiskPaneHeader } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskPaneTabsRouter } from '@src-v2/components/entity-pane/risk-pane/risk-pane-tabs-router';
import { EvidenceTabApiFindingCard } from '@src-v2/containers/entity-pane/api-finding/evidence-tab-api-finding-card';
import { useInject } from '@src-v2/hooks';

export function ApiFindingsRiskPane(props: RiskPaneProps) {
  const { inventory } = useInject();
  const fetchInventory = useCallback(
    ({ risk }) =>
      inventory.getApiFindingElement(
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
      <RiskPaneTabsRouter evidence={EvidenceTabApiFindingCard} remediate={() => <></>} />
    </RiskPane>
  );
}
