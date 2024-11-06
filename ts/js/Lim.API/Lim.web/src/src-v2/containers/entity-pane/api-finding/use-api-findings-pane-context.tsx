import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { Finding } from '@src-v2/types/inventory-elements/api/api-findings-summary';

export function useApiFindingsPaneContext() {
  return useEntityPaneContext<Finding>();
}
