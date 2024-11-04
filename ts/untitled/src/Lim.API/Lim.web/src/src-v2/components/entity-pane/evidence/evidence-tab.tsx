import { FC, useCallback } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { CollapsibleCardsController } from '@src-v2/components/cards/collapsbile-cards-controller';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { Link } from '@src-v2/components/typography';
import { useInject, useSuspense } from '@src-v2/hooks';
import { makeUrl } from '@src-v2/utils/history-utils';

export function EvidenceTab({ children }: { children: FC<ControlledCardProps> }) {
  const trackAnalytics = useTrackAnalytics();

  const handleToggleAll = useCallback(
    isOpen =>
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: `${isOpen ? 'Expand' : 'Collapse'} all`,
      }),
    [trackAnalytics]
  );

  return (
    <CollapsibleCardsController onToggle={handleToggleAll}>
      {props => (
        <>
          {children({ ...props })}
          <RuleDescriptionCard {...props} />
        </>
      )}
    </CollapsibleCardsController>
  );
}

function RuleDescriptionCard(props: ControlledCardProps) {
  const { governance } = useInject();
  const { risk } = useEntityPaneContext();
  const rule = useSuspense(governance.getRule, { key: risk.ruleKey });

  return (
    <ControlledCard {...props} title="Why am I seeing this?">
      <Link to={makeUrl('/governance/rules', { fl: { searchTerm: rule.name } })}>{rule.name}</Link>{' '}
      is a rule set by {rule.updatedBy ?? rule.createdBy ?? 'Apiiro'}. {rule.description}
    </ControlledCard>
  );
}
