import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { DependencyElement, Epss, ExploitMaturity } from '@src-v2/types/inventory-elements';
import { RiskFactor } from '@src-v2/types/pipelines/pipelines-types';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanCodeOwner } from '@src-v2/types/profiles/lean-developer';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { Provider } from '../enums/provider';

export interface ArtifactRisk {
  combinedRiskLevel: string;
  combinedRiskScore: number;
  containingRiskLevel: string[];
  riskFactors: RiskFactor[];
  totalAcceptedMatches: number;
  totalRulesWithAcceptedMatches: number;
  totalIgnoredMatches: number;
  totalRulesWithIgnoredMatches: number;
}

export interface ArtifactInsight {
  badge: string;
  description: string;
  sentiment: string;
}

export interface ArtifactEvidencesInfo {
  artifactImageUrl: string;
  artifactRepository: string;
  provider: string;
}

export interface Artifact {
  key: string;
  packageId: string;
  artifactRepositoryName: string;
  artifactEvidencesInfo: ArtifactEvidencesInfo[];
  displayName: string;
  type: string;
  versionsCount: number;
  sourcesProviders: string[];
  artifactRegistriesProvider: string;
  artifactTypeDisplayName: string;
  dependenciesCount: number;
  matchedCodeEntitiesCount: number;
  matchedCloudToolsCount: number;
  risk: ArtifactRisk;
  insights: ArtifactInsight[];
}

export interface PackageManagerInfo {
  name: string;
  displayName: string;
}

export interface ArtifactImageIdentification {
  imageId?: string;
  repoDigests: string[];
  repoTags: string[];
}

export interface ArtifactDependency {
  artifactImageIdentifications: ArtifactImageIdentification[];
  dependencyName: string;
  dependencyVersion: string;
  key: string;
  packageManager: PackageManagerInfo;
  sources: string[];
}

export interface ArtifactVersion {
  imageIdentification: ArtifactImageIdentification;
  key: string;
  sources: Provider[];
}

export interface ArtifactCodeAssetsRisk {
  combinedRiskLevel: string;
  combinedRiskScore: number;
  containingRiskLevel: string[];
  riskFactors: RiskFactor[];
  totalAcceptedMatches: number;
  totalIgnoredMatches: number;
  totalRulesWithAcceptedMatches: number;
  totalRulesWithIgnoredMatches: number;
}

export interface ArtifactCodeAssets {
  key: string;
  matchedAsset: string;
  serverUrl: string;
  repositoryKey: string;
  repositoryName: string;
  moduleName: string;
  matchType: string;
  repositoryProvider: string;
  repositoryBusinessImpact: BusinessImpact;
  repositoryRisk: ArtifactCodeAssetsRisk;
  repositoryIsActive: boolean | null;
  assetCollections: any[];
  relatedEntity: LeanConsumableProfile | null;
}

export interface ArtifactCloudTool {
  key: string;
  matchType: string;
  name: string;
  source: string;
  type: string;
}

export interface RelatedFinding {
  artifactKey: string;
  dependencyName: string;
  dependencyVersion: string;
  cveIdentifiers: string[];
  cweIdentifiers: string[];
  cvssScore: number;
  epss?: Epss;
  exploitMaturity: ExploitMaturity;
  nearestFixVersion: string;
  description?: string;
  imageIdentifications: ArtifactImageIdentification[];
  sourceProviderToUrls: Record<Provider, string[]>;
  severity: string;
  epssSeverity: string;
  isFixable: boolean;
  provider: Provider;
  url: string;
  versions: string[];
}

export interface RelatedFindingCodeRepository {
  artifactKey: string;
  codeReference: CodeReference;
  dependencyFindings: RelatedFinding[];
  dependencyName: string;
  moduleName: string;
  referenceName: string;
  repositoryBusinessImpact: string;
  repositoryIsActive: boolean;
  repositoryKey: string;
  provider: string;
  repositoryName: string;
  url: string;
  codeOwner: LeanCodeOwner;
}

export interface CodeAssetsDependency {
  moduleName: string;
  repositoryBusinessImpact: string;
  repositoryIsActive: boolean;
  repositoryKey: string;
  repositoryName: string;
  dependencyDeclarations: DependencyElement[];
  provider: string;
  referenceName: string;
  url: string;
}

export interface ArtifactServer {
  provider: string;
  serverUrl: string;
}

export interface ArtifactAsset {
  artifactDisplayName: string;
  artifactKey: string;
  displayName: string;
  key: string;
  provider: string;
  artifactRepositoryName: string;
  clusterNames: string[];
  accountIds: string[];
}
