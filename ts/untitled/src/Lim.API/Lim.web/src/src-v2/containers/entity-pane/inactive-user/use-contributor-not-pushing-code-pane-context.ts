import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { InactiveRepositoryContributorElement } from '@src-v2/types/inventory-elements/inactive-repository-contributor-element-response';

export function useContributorNotPushingCodeContext() {
  return useEntityPaneContext<InactiveRepositoryContributorElement>();
}
