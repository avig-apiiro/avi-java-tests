import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface InactiveRepositoryAdminElement extends BaseElement {
  adminIdentityKey: string;
  developerKey: string;
  lastActivity: Date;
}
