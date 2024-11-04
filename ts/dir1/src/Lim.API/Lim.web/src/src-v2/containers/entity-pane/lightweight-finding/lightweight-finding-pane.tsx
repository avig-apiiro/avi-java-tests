import { useCallback } from 'react';
import { RiskPane, RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { RiskPaneHeader } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskPaneTabsRouter } from '@src-v2/components/entity-pane/risk-pane/risk-pane-tabs-router';
import { LightWeightEvidenceTab } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/evidence-tab';
import { LightweightRemediationCard } from '@src-v2/containers/entity-pane/lightweight-finding/lightweight-remediation-card';
import { useInject } from '@src-v2/hooks';

export const LightweightFindingPane = (props: RiskPaneProps) => {
  const { findings } = useInject();
  const findingDataFetcher = useCallback(
    ({ dataModelReference }) => findings.getFinding(dataModelReference),
    []
  );

  return (
    <RiskPane {...props} header={<RiskPaneHeader />} findingDataFetcher={findingDataFetcher}>
      <RiskPaneTabsRouter
        evidence={LightWeightEvidenceTab}
        remediate={LightweightRemediationCard}
      />
    </RiskPane>
  );
};
