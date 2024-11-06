import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { DiscoveredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { BranchProtectionElement } from '@src-v2/types/inventory-elements/branch-protection-element';

export function AboutThisBranchProtectionCard(props: ControlledCardProps) {
  const { element, risk } = useEntityPaneContext<BranchProtectionElement>();

  let configurationContent;
  switch (element.ruleType) {
    case 'Deletion':
      configurationContent = 'Deletion is allowed';
      break;
    case 'ForcePush':
      configurationContent = 'Force push is allowed';
      break;
    case 'RequiredCodeReviewers':
      configurationContent = `${element.ruleValueInt ?? '0'} required code reviewers`;
      break;
    default:
      configurationContent = '';
  }

  return (
    <ControlledCard title="About this risk" {...props}>
      <RiskLevelWidget risk={risk} />
      <DiscoveredEvidenceLine risk={risk} />
      <DueDateEvidenceLine risk={risk} />
      <EvidenceLine label="Branch configuration">
        <ConfigurationContent>{configurationContent}</ConfigurationContent>
      </EvidenceLine>
      {Boolean(risk.insights?.length) && (
        <EvidenceLine label="Insights">
          <ElementInsights insights={risk.insights} />
        </EvidenceLine>
      )}
      <EvidenceLine label="Risk category">{risk.riskCategory}</EvidenceLine>
    </ControlledCard>
  );
}

const ConfigurationContent = styled.span`
  color: var(--color-red-60);
`;
