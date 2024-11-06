import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { Language } from '@src-v2/types/enums/language';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';

interface DeveloperCountersWithSamples {
  count: number;
  samples: LeanDeveloper[];
}

interface ContributorsCounters {
  total: number;
  recentlyActive: DeveloperCountersWithSamples;
  recentlyJoined: DeveloperCountersWithSamples;
  securityRelated: DeveloperCountersWithSamples;
}

export interface AttackSurfaceSummary {
  hasApis: boolean;
  hasAuthenticationUsage: boolean;
  hasAuthorizationUsage: boolean;
  hasEncryptionUsage: boolean;
  hasSensitiveData: boolean;
  isDeployed: boolean;
  isDeployedToCloud: boolean;
  isHybridDeploy: boolean;
  isInternetExposed: boolean;
  isUserFacing: boolean;
}

export interface RiskFactor {
  title: string;
  ruleKey: string;
  riskLevel: keyof typeof RiskLevel;
}

export abstract class CodeProfileResponse {
  key: string;
  name: string;
  uniqueName: string;
  isActive: boolean;
  firstActivityAt: Date;
  lastActivityAt: Date;
  riskLevel: keyof typeof RiskLevel;
  riskFactors: RiskFactor[];
  businessImpactLevel: keyof typeof BusinessImpact;
  languages: (keyof typeof Language)[];
  languagePercentages: Record<keyof typeof Language, number>;
  contributors: ContributorsCounters;
  attackSurfaceSummary: AttackSurfaceSummary;
  stillProcessing?: boolean;
  riskScore: number;

  abstract get profileType(): string;
}
