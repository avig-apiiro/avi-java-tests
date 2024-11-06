import { Provider } from '@src-v2/types/enums/provider';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { CodeReference, ParsingTargetCodeReference } from '@src-v2/types/risks/code-reference';
import { Insight } from '@src-v2/types/risks/insight';
import { UsedInCode } from '@src-v2/types/risks/risk-types/oss-risk-trigger-summary';

export type EpssSeverity = 'Low' | 'Medium' | 'High';

type OSSInsightCategory = 'OssPackageHealth' | 'OssLicenseCompliance' | 'OssSecurity';

export type DependencyRemediationStrategy = 'TopLevel' | 'Direct' | 'Pinning';

interface Triage {
  cve: string;
  description: string;
  exploitExample: string;
  summary: string;
  modified: Date;
}

interface Epss {
  cve: string;
  epssScore: number;
  modified: Date;
  percentile: number;
}

interface SecurityAdvisoryReference {
  securityAdvisory: string;
  identifier: string;
  url: string;
}

interface BaseFinding {
  cveIdentifiers: string[];
  securityAdvisoryReferences: SecurityAdvisoryReference[];
  cweIdentifiers: string[];
}

export interface TopLevelUsedInCode {
  id: string;
  name: string;
  usedInCodeStatus: UsedInCode;
  version: string;
  usedInCodeReferences: ParsingTargetCodeReference[];
}

export type ExploitMaturity =
  | 'Known exploit'
  | 'Exploit POC'
  | 'High EPSS'
  | 'No exploit maturity data'
  | 'No known exploit';

export interface DependencyFinding extends BaseFinding {
  displayName: string;
  entityId: string;
  scanProjectName: string;
  severity?: RiskLevel;
  exploitMaturity: ExploitMaturity;
  exploitMaturities: ExploitMaturity[];
  cvssScore: number;
  nearestFixedVersion: string;
  fixedInVersion: string;
  provider: Provider;
  url?: string;
  isApiProvided: boolean;
  isFixable: boolean;
  isKev: boolean;
  epss: Epss;
  epssSeverity: EpssSeverity;
  pocReferences: Record<string, Record<string, string[]>>;
  triage?: Triage;
  artifactNames?: string[];
}

export interface PackageDigest {
  description: string;
  homePageUrl: string;
  licenses: string[];
  lastVersion: string;
  insights: Record<OSSInsightCategory, Insight[]>;
}

export interface LibraryUsagesSummary {
  usagesCodeReferences: ParsingTargetCodeReference[];
}

export interface SuggestedVersion {
  version: string;
  severity?: string;
  findings: (BaseFinding & { severity: string; summary: string })[];
}

export interface DependencyInfo {
  name: string;
  version: string;
}

export interface RemediationSegment {
  packageName: string;
  packageVersion: string;
  fixVersion: string;
  codeReference: CodeReference;
}

export interface DependencyInfoPath {
  codeReference?: CodeReference;
  orderedPath: DependencyInfo[];
  isDevDependency: boolean;
  usedInCodeStatus: UsedInCode;
  usedInCodeReferences: ParsingTargetCodeReference[];
}

export interface DependencyInfoPathsSummary {
  totalInfoPathsCount?: number;
  topInfoPaths: DependencyInfoPath[];
  hasSameCodeReference?: boolean;
}

export interface DependencyRemediation {
  minimalFixVersion: string;
  codeReference: CodeReference;
  remediationSegments: RemediationSegment[];
  isSubDependencyRemediationSupported: boolean;
  strategy: DependencyRemediationStrategy;
}

export interface DependencyElement extends BaseElement {
  name: string;
  description: string;
  suggestedVersion?: SuggestedVersion;
  dependencyInfoPathsSummary?: DependencyInfoPathsSummary;
  dependencyRemediation?: Record<Provider, DependencyRemediation>;
  dependencyPaths?: Record<string, DependencyInfoPathsSummary>;
  dependencyType: string;
  homePageUrl: string;
  version: string;
  resolvedVersion?: string;
  isSubDependency: boolean;
  dependencyFindings: DependencyFinding[];
  topLevelDependencies: { id: string; name: string; codeReference: CodeReference }[];
  packageDigest: PackageDigest;
  libraryUsagesSummary: LibraryUsagesSummary;
  cicdPipelineTechnology: string;
  maxSeverity: string;
  usedInCodeStatus: UsedInCode;
  usedInCodeReferences: ParsingTargetCodeReference[];
  topLevelUsedInCode: TopLevelUsedInCode[];
}

export interface CiCdDependencyElement extends DependencyElement {
  id: string;
  technologyDescription: string;
  technologyDependencyDescription: string;
}
