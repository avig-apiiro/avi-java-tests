import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { DependencyElement } from '@src-v2/types/inventory-elements';

export function useScaPaneContext() {
  return useEntityPaneContext<DependencyElement>();
}
