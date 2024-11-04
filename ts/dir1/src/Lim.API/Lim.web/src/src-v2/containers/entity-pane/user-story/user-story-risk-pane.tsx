import { useCallback } from 'react';
import { RiskPane, RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { RiskPaneHeader } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskPaneTabsRouter } from '@src-v2/components/entity-pane/risk-pane/risk-pane-tabs-router';
import { UserStoryRemediationTab } from '@src-v2/containers/entity-pane/user-story/main-tab/user-story-remediation-tab';
import { useInject } from '@src-v2/hooks';
import { UserStoryMainTab } from './main-tab/user-story-main-tab';

export function UserStoryRiskPane(props: RiskPaneProps) {
  const { inventory } = useInject();

  const fetchInventory = useCallback(
    ({ risk }) =>
      inventory.getInventoryElement(
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
    <RiskPane {...props} elementDataFetcher={fetchInventory} header={<RiskPaneHeader />}>
      <RiskPaneTabsRouter evidence={UserStoryMainTab} remediate={UserStoryRemediationTab} />
    </RiskPane>
  );
}
