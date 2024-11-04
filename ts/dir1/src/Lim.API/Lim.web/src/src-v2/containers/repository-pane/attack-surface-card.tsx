import { Card } from '@src-v2/components/cards';
import { CardTitle } from '@src-v2/components/panes/pane-body';
import { AttackSurfaceSummaryChips } from '@src-v2/containers/profiles/attack-surface-summary-chips';
import { useRepositoryContext } from '@src-v2/containers/repository-pane/repository-context-provider';

export function AttackSurfaceCard() {
  const { repository } = useRepositoryContext();

  return (
    <Card>
      <CardTitle>Attack surface summary</CardTitle>
      <AttackSurfaceSummaryChips attackSurfaceSummary={repository.attackSurfaceSummary} />
    </Card>
  );
}
