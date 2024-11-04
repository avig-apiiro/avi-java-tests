import { EntityType } from '@src-v2/types/enums/entity-type';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface InventoryElementCollectionRow<T extends BaseElement> {
  key: string;
  entityKey: string;
  entityType: keyof typeof EntityType;
  profileType: 'RepositoryProfile' | 'ProjectProfile';
  profileKey: string;
  objectType: string;
  diffableEntity: T;
}
