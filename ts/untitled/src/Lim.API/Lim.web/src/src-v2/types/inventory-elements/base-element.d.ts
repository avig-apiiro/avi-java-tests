import { EntityType } from '@src-v2/types/enums/entity-type';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { Insight } from '@src-v2/types/risks/insight';

export interface BaseElement {
  displayName: string;
  entityId: string;
  entityType: EntityType;
  codeReference?: CodeReference;
  codeOwnerEntity?: { identityKey: string };
  repositoryAndModuleReferences?: { repositoryProfileKey: string; moduleRoot: string }[];
  insights: Insight[];
}
