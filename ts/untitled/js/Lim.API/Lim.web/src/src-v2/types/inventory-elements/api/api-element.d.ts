import { Provider } from '@src-v2/types/enums/provider';
import { InventoryElementCollectionRow } from '@src-v2/types/inventory-elements/inventory-element-collection-row';

export interface RelatedEndpoint {
  route: string;
  method: string;
  externalUrl: string;
  serviceName: string;
  serviceExternalUrl: string;
  provider: Provider;
  hostName: string;
}

export interface ApiDiffableEntityType {
  relatedEndpointSources: Provider[];
  relatedEndpoints: RelatedEndpoint[];
}

export interface ApiElement extends InventoryElementCollectionRow<ApiDiffableEntityType> {}
