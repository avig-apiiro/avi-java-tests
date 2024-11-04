import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { SensitiveDataElement } from '@src-v2/types/inventory-elements/sensitive-data-element';

export function useSensitiveDataPaneContext() {
  return useEntityPaneContext<SensitiveDataElement>();
}
