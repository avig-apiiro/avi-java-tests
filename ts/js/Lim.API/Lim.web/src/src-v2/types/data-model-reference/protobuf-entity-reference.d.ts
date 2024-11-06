import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { EntityType } from '@src-v2/types/enums/entity-type';

export interface ProtobufEntityReference extends DiffableEntityDataModelReference {
  diffableEntityObjectType: EntityType.ProtobufMessage | EntityType.ProtobufService;
}
