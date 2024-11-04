import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { InactiveRepositoryAdminElement } from '@src-v2/types/inventory-elements/inactive-repository-admin-element-response';

export function useInactiveAdminContext() {
  return useEntityPaneContext<InactiveRepositoryAdminElement>();
}
