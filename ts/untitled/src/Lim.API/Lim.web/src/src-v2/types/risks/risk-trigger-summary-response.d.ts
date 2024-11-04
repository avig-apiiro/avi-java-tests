import { OptionalDate } from '@src-v2/components/time';
import {
  DiffableEntityDataModelReference,
  FindingDataModelReference,
} from '@src-v2/types/data-model-reference/data-model-reference';
import { Provider } from '@src-v2/types/enums/provider';
import { RiskLevel, RiskStatus } from '@src-v2/types/enums/risk-level';
import { RiskTriggerElementType } from '@src-v2/types/enums/risk-trigger-element-type';
import { ExposurePathResponse } from '@src-v2/types/exposure-path';
import { ComplianceFrameworkReference } from '@src-v2/types/inventory-elements/code-findings';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanCodeOwner } from '@src-v2/types/profiles/lean-developer';
import { LeanOrgTeamWithPointsOfContact } from '@src-v2/types/profiles/lean-org-team';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { ActionsTakenSummary } from '@src-v2/types/risks/action-taken-details';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { Insight } from '@src-v2/types/risks/insight';
import { RiskOverrideData } from '@src-v2/types/risks/risk-override-data';

export interface RelatedFinding {
  codeReference: CodeReference;
  dataModelReferenceFinding: DiffableEntityDataModelReference;
  dataModelRelationType: string;
  relatedFindingSummaryInfo: {
    complianceFrameworkReferences: ComplianceFrameworkReference[];
    issueTitle: string;
    provider: string;
    severity: keyof typeof RiskLevel;
  };
}

interface FindingComponent {
  name: string;
  role: string;
  type: string;
  componentTitle: string;
  componentSubtitle: string;
  artifactKey: string;
  artifactDisplayName: string;
  packageId: string;
}

interface SlaPolicyMetadata {
  key: string | 'GlobalSlaKey';
  name: string;
}

export interface RiskTriggerSummaryResponse {
  key: string;
  riskName: string;
  riskLevel: RiskLevel;
  riskStatus: RiskStatus;
  riskType: string;
  ruleKey: string;
  ruleName: string;
  shortSummary?: string;
  ruleRiskLevel: RiskLevel;
  riskCategory: string;
  triggerKey: string;
  elementKey: string;
  dependencyName: string;
  elementType: keyof typeof RiskTriggerElementType;
  actionsTakenSummaries: ActionsTakenSummary[];
  insights: Insight[];
  applications: LeanApplication[];
  orgTeams: LeanOrgTeamWithPointsOfContact[];
  relatedEntity: LeanConsumableProfile;
  relatedFindings: RelatedFinding[];
  repositoryAndModuleReferences: { repositoryProfileKey: string; moduleRoot: string }[];
  codeReference: CodeReference;
  codeOwner: LeanCodeOwner;
  riskOverrideData: RiskOverrideData;
  providers: Provider[];
  discoveredAt: Date;
  moduleName: string;
  repositoryTags: TagResponse[];
  applicationTags: TagResponse[];
  dataModelReference: FindingDataModelReference | null;
  findingComponents: FindingComponent[];
  findingName: string | null;
  displayName: string | null;
  serverUrl: string | null;
  primaryDataModelReference: DiffableEntityDataModelReference | null;
  exposurePath: ExposurePathResponse;
  dueDate: OptionalDate;
  slaPolicyMetadata: SlaPolicyMetadata;
  profile?: LeanConsumableProfile & { profileType: any };
}
