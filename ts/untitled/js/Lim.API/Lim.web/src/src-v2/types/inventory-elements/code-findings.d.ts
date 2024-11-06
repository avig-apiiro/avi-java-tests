import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { Provider } from '@src-v2/types/enums/provider';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { Insight } from '@src-v2/types/risks/insight';

export interface ComplianceFrameworkReference {
  identifier: string;
  description: string;
  url: string;
  securityComplianceFramework: string;
}

interface RelatedEntitySummaryInfo {
  httpMethod: string;
  httpRoute: string;
  insights: Insight[];
}

interface RelatedEntity {
  dataModelReference: DiffableEntityDataModelReference;
  dataModelRelationType: string;
  relatedEntitySummaryInfo: RelatedEntitySummaryInfo;
  codeReference: CodeReference;
}

export interface CodeFindings extends BaseElement {
  FirstOccurenceTime: Date;
  FirstOccurenceTimeParsed: Date;
  applicationName: string;
  artifactNames: string;
  attackSurfaceCount: number;
  branchName: string;
  commitSha: string;
  confidence: string;
  cweIdentifiers: string[];
  description: string;
  displayName: string;
  endLineNumber: number;
  exploitability: string;
  externalSeverity: string;
  externalStatus: string;
  externalType: string;
  filePath: string;
  findingSourceType: string;
  id: string;
  isApiProvided: boolean;
  issueTitle: string;
  lineNumber: number;
  modulePath: string;
  provider: Provider;
  providerType: string;
  relatedApiMethodIds: string[];
  relatedApis?: string[];
  remediation: string;
  reportTags: any;
  reportUrl: string;
  repositoryCloneUrl: string;
  repositoryKey: string;
  repositoryKeys: string;
  scanProjectName: string;
  complianceFrameworkReferences: ComplianceFrameworkReference[];
  scanType: string;
  severity: string;
  standards: string[];
  tags: any;
  time: Date;
  timeMaterialized?: Date;
  type: string;
  url: string;
  vulnerabilityType: string;
  likelihood?: string;
  additionalReferenceUrls?: string[];
  latestDetectionTime: Date;
  firstDetectionTime: Date;
  relatedEntities: RelatedEntity[];
}
