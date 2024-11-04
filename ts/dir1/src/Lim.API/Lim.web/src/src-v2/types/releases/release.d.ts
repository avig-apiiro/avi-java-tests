import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';

export interface ReleaseSide {
  badges: string[];
  commitSha: string;
  identifier: string;
  refType: 'Branch' | 'Tag' | 'Commit';
  risk: { combinedRiskLevel: RiskLevel };
}

export interface Release {
  key: string;
  name: string;
  repositoryKey: string;
  isDone: boolean;
  isRepositoryMonitored: boolean;
  status: string;
  baseline: ReleaseSide;
  candidate: ReleaseSide;

  relatedRepositoryProfile: LeanConsumableProfile;
}
