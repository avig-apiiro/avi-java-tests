import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { ApiElementResponse } from '@src-v2/types/inventory-elements/api/api-element-response';
import { ApiRiskTriggerSummary } from '@src-v2/types/risks/risk-types/api-risk-trigger-summary';

export function useApiPaneContext() {
  return useEntityPaneContext<ApiElementResponse, ApiRiskTriggerSummary>();
}
