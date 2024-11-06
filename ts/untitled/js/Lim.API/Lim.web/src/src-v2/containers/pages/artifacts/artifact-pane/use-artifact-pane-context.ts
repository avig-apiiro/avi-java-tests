import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { CodeFindings } from '@src-v2/types/inventory-elements/code-findings';

export function useArtifactPaneContext() {
  return useEntityPaneContext<CodeFindings>();
}
