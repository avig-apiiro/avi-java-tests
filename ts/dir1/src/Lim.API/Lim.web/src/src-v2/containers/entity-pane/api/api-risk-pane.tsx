import { useCallback } from 'react';
import styled from 'styled-components';
import { CodeBadge } from '@src-v2/components/badges';
import { RiskPane, RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { RiskPaneHeader } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskPaneTabsRouter } from '@src-v2/components/entity-pane/risk-pane/risk-pane-tabs-router';
import { EllipsisText, SubHeading3 } from '@src-v2/components/typography';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { useInject } from '@src-v2/hooks';
import { ApiMainTab } from './main-tab/api-main-tab';

export function ApiRiskPane(props: RiskPaneProps) {
  const { apiRisks, inventory } = useInject();
  const fetchInventory = useCallback(
    ({ risk }) =>
      inventory.getApiElement(
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
    <RiskPane
      {...props}
      riskDataFetcher={apiRisks.getApiTrigger}
      elementDataFetcher={fetchInventory}
      header={<RiskPaneHeader subtitle={HttpMethodSubtitle} />}>
      <RiskPaneTabsRouter evidence={ApiMainTab} remediate={() => <></>} />
    </RiskPane>
  );
}

const HttpMethodSubtitle = styled(props => {
  const { risk } = useApiPaneContext();

  return (
    <SubHeading3 {...props}>
      <CodeBadge>{risk.httpMethod}</CodeBadge>
      <EllipsisText>{risk.httpRoute}</EllipsisText>
    </SubHeading3>
  );
})`
  display: flex;
  gap: 1rem;
  align-items: center;
`;
