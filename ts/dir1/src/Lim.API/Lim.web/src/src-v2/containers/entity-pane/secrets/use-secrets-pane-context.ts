import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { SecretElement } from '@src-v2/types/inventory-elements';

export function useSecretsPaneContext() {
  return useEntityPaneContext<SecretElement>();
}
