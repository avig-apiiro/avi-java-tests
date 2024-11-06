import { LeanConsumable } from '@src-v2/types/profiles/lean-consumable';
import { LeanPointOfContact } from '@src-v2/types/profiles/lean-developer';
import { RepositoryGroup } from '@src-v2/types/profiles/repository-profile-response';
import { BusinessImpact } from '../../enums/businessImpact';
import { ProfileType } from '../../enums/profileType';

export type BusinessImpactFactorType = {
  title: string;
  riskLevel: string;
  isConfigurable: boolean;
};

export interface LeanApplication {
  key: string;
  name: string;
  businessImpact: BusinessImpact;
  profileType: ProfileType;
  projects: LeanConsumable[];
  repositories: LeanConsumable[];
  repositoryGroups: RepositoryGroup[];
  businessImpactFactors?: BusinessImpactFactorType[];
  parentKey?: string;
  description?: string;
  applicationType?: string;
  applicationTypeOther?: string;
}

export interface LeanApplicationWithPointsOfContact extends LeanApplication {
  pointsOfContact: LeanPointOfContact[];
}
