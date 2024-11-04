import { Card } from '@src-v2/components/cards';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { CardTitle } from '@src-v2/components/panes/pane-body';
import { Link } from '@src-v2/components/typography';
import { useCodeModuleContext } from '@src-v2/containers/code-module-pane/code-module-context-provider';
import { Insight } from '@src-v2/types/risks/insight';

export function AboutThisModuleCard() {
  const { module, repositoryProfile } = useCodeModuleContext();

  const insights = [
    module.isSensitive
      ? ({
          badge: 'Sensitive',
          sentiment: 'Neutral',
        } as Insight)
      : null,
  ].filter(Boolean);

  return (
    <Card>
      <CardTitle>About this module</CardTitle>
      <EvidenceLine label="Module profile">
        <Link
          to={`/module/${encodeURIComponent(repositoryProfile.key)}/${encodeURIComponent(
            module.key
          )}`}>
          {module.name}
        </Link>
      </EvidenceLine>
      <EvidenceLine label="Path">
        {repositoryProfile.name}/{module.name}
      </EvidenceLine>
      {Boolean(insights.length) && (
        <EvidenceLine label="Insights">
          <ElementInsights insights={insights} />
        </EvidenceLine>
      )}
    </Card>
  );
}
