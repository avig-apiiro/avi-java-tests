import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { DiscoveredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import { EvidenceLinesWrapper } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { useUserStoryPaneContext } from '@src-v2/containers/entity-pane/user-story/use-user-story-pane-context';

export function AboutUserStoryRiskCard(props: ControlledCardProps) {
  const { risk } = useUserStoryPaneContext();

  return (
    <ControlledCard {...props} title="About this risk">
      <EvidenceLinesWrapper>
        {risk && <RiskLevelWidget isExtendedWidth risk={risk} />}
        {risk && (
          <>
            <DiscoveredEvidenceLine isExtendedWidth risk={risk} />
            <DueDateEvidenceLine isExtendedWidth risk={risk} />
          </>
        )}
        <SourceEvidenceLine isExtendedWidth providers={risk.providers} />
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}
