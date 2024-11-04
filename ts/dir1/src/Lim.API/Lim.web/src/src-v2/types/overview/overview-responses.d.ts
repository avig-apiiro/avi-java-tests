import { DevPhase } from '@src-v2/types/enums/dev-phase';
import { ProviderGroupType } from '@src-v2/types/enums/provider-group-type';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { OverviewLineItem } from '@src-v2/types/overview/overview-line-item';
import { ApplicationProfileResponse } from '@src-v2/types/profiles/application-profile-response';
import { OrganizationTeamProfileResponse } from '@src-v2/types/profiles/organization-team-profile-response';
import { RepositoryProfileResponse } from '@src-v2/types/profiles/repository-profile-response';

export interface OverviewTopRisksItem {
  ruleName: string;
  severity: keyof typeof RiskLevel;
  count: number;
  devPhase: DevPhase;
}

export type MTTRStatItem = {
  riskLevel: keyof typeof RiskLevel;
  meanTimeInHours: number;
};

export type SLAStatItem = {
  riskLevel: keyof typeof RiskLevel;
  slaValue: number;
};

export type MttrVsSlaStatItem = {
  mttrStats: MTTRStatItem;
  slaStats: SLAStatItem;
};
export interface TopRepositoryItem {
  count: number;
  repositoryProfile: RepositoryProfileResponse;
}

export interface TopRiskScoreTeamItem {
  riskScore: number;
  teamProfile: OrganizationTeamProfileResponse;
}

export interface TopRiskScoreApplicationItem {
  riskScore: number;
  assetCollection: ApplicationProfileResponse;
}

export interface TopRiskScoreRepositoryItem {
  riskScore: number;
  repositoryProfile: RepositoryProfileResponse;
}

export type Severity = keyof typeof RiskLevel;
export type RiskAgeRange = '0-2' | '2-7' | '7-14' | '14-30' | '30+';
export type RiskLevelsCountByAgeRange = Partial<
  Record<RiskAgeRange, Partial<Record<Severity, number>>>
>;

export interface CoverageSummary {
  Sast?: Record<string, string>;
  Runtime?: Record<string, unknown>;
  Sca?: Record<string, string>;
  Secrets?: Record<string, string>;
  ApiSecurity?: Record<string, string>;
}

export interface RisksByAgeAndSeverity {
  ageRanges: Partial<Record<Severity, number>>;
}

export type CommitsOverTimeResponse = {
  commits: OverviewLineItem[];
  materialChangesOverTime: OverviewLineItem[];
  riskyMaterialChangesOverTime: OverviewLineItem[];
};

interface DailyRiskScore {
  date: string;
  count: number;
}

export type RiskScoreTrendResponse = DailyRiskScore[];

export type RisksStatusOverTimeResponse = {
  detectedRisks: OverviewLineItem[];
  closedRisks: OverviewLineItem[];
};

export type ManualActionsOverTimeResponse = {
  triggerMessages: OverviewLineItem[];
  triggerIssues: OverviewLineItem[];
};

export type WorkflowActionsOverTimeResponse = {
  triggeredMessageActions: OverviewLineItem[];
  triggeredProjectActions: OverviewLineItem[];
  triggeredPullRequestActions: OverviewLineItem[];
};

export type SlaBreachesResponse = {
  riskLevel: RiskLevel;
  slaBreach: number;
  slaAdherence: number;
  unsetDueDate: number;
}[];

export type PullRequestsOverTimeResponse = {
  pullRequests: OverviewLineItem[];
  pullRequestsWithRisk: OverviewLineItem[];
  pullRequestsWithAction: OverviewLineItem[];
};

export enum SDLCInfoCategory {
  Design,
  Development,
  Build,
  Runtime,
}

export type SDLCInfoResult = {
  type: keyof typeof ProviderGroupType;
  hasConnections: boolean;
  count: number;
  vendors?: { key: string; displayName: string; iconName?: string }[];
};

export type AppsRiskScoreResponse = {
  businessImpact: string;
  range: number;
  count: number;
};
