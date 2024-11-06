import { RepositoryDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';

export interface ModuleProfileResponse extends RepositoryDataModelReference {
  repositoryProfile: LeanConsumableProfile;
  applications: LeanApplication[];
}
