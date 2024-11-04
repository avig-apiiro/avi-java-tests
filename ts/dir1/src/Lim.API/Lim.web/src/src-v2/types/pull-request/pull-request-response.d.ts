import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { ScanStatus } from '@src-v2/types/enums/scan-status';
import { GovernanceRule } from '@src-v2/types/governance/governance-rules';
import { MaterialChange } from '@src-v2/types/material-changes/material-changes';
import { ApplicationGroupProfile } from '@src-v2/types/profiles/application-group-profile';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanOrgTeamWithPointsOfContact } from '@src-v2/types/profiles/lean-org-team';
import { ReleaseSide } from '@src-v2/types/releases/release';

export type PullRequestScanResponse = {
  key: string;
  pullRequestId?: number;
  title: string;
  url: string;
  lastScanDate?: never;
  risksCount: number;
  riskLevel: RiskLevel;
  scanStatus: ScanStatus;
  unblockedBy: string;
  unblockedAt: Date;
  createdAt: Date;
  baseline: ReleaseSide;
  candidate: ReleaseSide;
  repository: LeanConsumableProfile;
  applications: LeanApplication[];
  orgTeams: LeanOrgTeamWithPointsOfContact[];
  applicationGroups: ApplicationGroupProfile[];
};

export type PullRequestMaterialChangesSummary = {
  key: string;
  label: string;
  materialChange: MaterialChange & { sourceCommitSha: string; targetCommitSha: string };
  governanceRule: GovernanceRule;
};
