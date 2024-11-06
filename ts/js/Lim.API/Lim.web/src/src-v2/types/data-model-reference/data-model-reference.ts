import { EntityType } from '@src-v2/types/enums/entity-type';

export interface BaseDataModelReference {
  identifier?: string;
}

export interface RiskDataModelReference extends BaseDataModelReference {
  riskTriggerSummaryKey: string;
}

export interface DiffableEntityDataModelReference extends BaseDataModelReference {
  containingProfileId: string;
  containingProfileType: 'RepositoryProfile' | 'ProjectProfile';
  diffableEntityId: string;
  diffableEntityType: keyof typeof EntityType;
  diffableEntityObjectType: string;
  inventoryTableEntityType: EntityType;
}

export interface ModuleDataModelReference extends BaseDataModelReference {
  repositoryKey: string;
  moduleKey: string;
  moduleName: string;
}

export interface RepositoryDataModelReference extends BaseDataModelReference {
  repositoryKey: string;
}

export interface DeveloperDataModelReference extends BaseDataModelReference {
  developerProfileKey: string;
}

export interface FindingDataModelReference extends BaseDataModelReference {
  findingId: string;
  findingType: string;
}

export interface ArtifactDataModelReference extends BaseDataModelReference {
  artifactMultiSourcedEntityKey: string;
}

export interface PrScanDataModelReference extends BaseDataModelReference {
  scanKey: string;
}
