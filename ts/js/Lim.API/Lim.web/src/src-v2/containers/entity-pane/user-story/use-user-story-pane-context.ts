import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { RiskyIssue } from '@src-v2/types/inventory-elements/risky-issue';

export function useUserStoryPaneContext() {
  return useEntityPaneContext<RiskyIssue>();
}
