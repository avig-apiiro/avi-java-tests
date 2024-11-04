import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { Provider } from '@src-v2/types/enums/provider';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { Insight } from '@src-v2/types/risks/insight';

export enum ResolvedCheckedOutRepositoryStatus {
  Monitored = 'Monitored',
  Unmonitored = 'Unmonitored',
  Unmatched = 'Unmatched',
}

export interface Dependencies {
  name: string;
  codeReference: CodeReference;
  version: string;
  insights: Insight[];
}

export interface CheckedOutRepositories {
  key: string;
  name: string;
  link: string;
  linkErrorMessage: string;
  branch: string;
  riskLevel: string;
  repositoryKey: string;
  repositoryGroup: string;
  isParent: boolean;
  commitCount: number;
  businessImpact: BusinessImpact;
  status: ResolvedCheckedOutRepositoryStatus;
  UnmatchedReason: string;
  isValidBranchName: boolean;
  isValidRepositoryName: boolean;
  provider?: string;
  isActive?: boolean;
}

interface PipelineBuildParameter {
  name: string;
  value?: string;
}

interface PipelineProducedArtifact {
  id: string;
  name: string;
  relativePath: string;
  url: string;
  sizeInBytes: number;
  createdAt?: Date;
}

interface PipelineInstanceRun {
  id: string;
  name: string;
  status: string;
  startedAt: Date;
  duration: number;
}

interface PipelineInstance {
  url: string;
  id: string;
  name: string;
  runCount: string;
  createdAt?: Date;
  recentRunHistory: PipelineInstanceRun[];
  triggers: any[];
  buildParameters: PipelineBuildParameter;
}

enum PipelineSecretExposure {
  Managed = 'Managed',
  Exposed = 'Exposed',
}

export interface PipelineSecret {
  name: string;
  exposure: PipelineSecretExposure;
  filePath: string;
  lineNumber: number;
}

interface CommonRepositories {
  key: string;
  name: string;
  branch: string;
}

export interface PipelineApplication {
  key: string;
  name: string;
  businessImpact: BusinessImpact;
  riskLevel: string;
  commonRepositories: CommonRepositories[];
  configuredBusinessImpact: string;
  businessImpactToKeywords: {
    Low: string[];
    Medium: string[];
    High: string[];
  };
}

interface DeclaringRepositoryBusinessImpact {
  businessImpact: BusinessImpact;
  configuredBusinessImpact: BusinessImpact;
  businessImpactToKeywords: {
    Low: string[];
    Medium: string[];
    High: string[];
  };
  isInternetFacing: boolean;
}

export interface RiskFactor {
  instances: number;
  isActionable: boolean;
  riskLevel: RiskLevel;
  riskScore: number;
  ruleKey: string;
  ruleName: string;
}

export interface PipelineRisk {
  combinedRiskLevel: string;
  combinedRiskScore: number;
  containingRiskLevel: string[];
  riskFactors: RiskFactor[];
  totalIgnoredMatches: number;
  totalRulesWithAcceptedMatches: number;
  totalRulesWithIgnoredMatches: number;
}

export interface Pipeline {
  declaringRepositoryKey: string;
  declarationFileReference: CodeReference;
  id: string;
  cicdTechnology: Provider;
  pluginReferences?: any;
  key: string;
  pipelineProcessDefinition?: any;
  instances?: PipelineInstance[];
  triggers?: any;
  producedArtifacts?: PipelineProducedArtifact[];
  inputSourceFiles?: CodeReference[];
  buildParameters?: PipelineBuildParameter[];
  checkedOutRepositories: CheckedOutRepositories[];
  dependencies: Dependencies[];
  secrets: PipelineSecret[];
  declaringRepositoryName: string;
  declaringRepositoryBranchName: string;
  declaringRepositoryProviderGroup: string;
  relativeFilePath: string;
  pipelineUrls: string[];
  declaringRepositoryBusinessImpact: DeclaringRepositoryBusinessImpact;
  sourceTypesToDescriptions?: Record<string, string[]>;
  applications: PipelineApplication[];
  codeReference: CodeReference;
  repositoryUrl: string;
  entityId: string;
  risk?: PipelineRisk;
}

export interface CICDServer {
  serverUrl: string;
  cicdTechnology: Provider;
  pipelinesCount: number;
  dependenciesCount: number;
}

export interface CICDServerPipeline {
  key: string;
  pipelineId: string;
  cicdTechnology: Provider;
}

export interface CICDServerDependency {
  key: string;
  name: string;
  provider: string;
  cicdTechnology: Provider;
  version: string;
  insights: Insight[];
}

export interface CICDServerDependencyVulnerability {
  id: string;
  message: string;
  provider: string;
  url: string;
  versionRanges: { firstVersion: string; lastVersion: string }[];
}

export interface CICDServerDependencyInfo {
  dependency: CICDServerDependency;
  vulnerabilities: CICDServerDependencyVulnerability[];
  serverUrl: string;
}

export interface SortOption {
  key: string;
  label: string;
}
