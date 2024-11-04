import { ArtifactImageIdentification } from '@src-v2/types/artifacts/artifacts-types';
import { Provider } from '@src-v2/types/enums/provider';
import { ComplianceFrameworkReference } from '@src-v2/types/inventory-elements/code-findings';
import {
  DependencyFinding,
  DependencyInfoPathsSummary,
} from '@src-v2/types/inventory-elements/dependency-element';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';

interface CvssInfo {
  version: string;
  score: number;
  vector: string;
}

type EvidenceType =
  | 'LightweightFindingEvidenceHttpRequest'
  | 'LightweightFindingEvidenceGeneral'
  | 'LightweightFindingEvidenceHttpResponse';

interface FindingEvidence {
  description: string;
  _t: EvidenceType;
}

export interface HttpRequestEvidence extends FindingEvidence {
  method: string;
  url: string;
}

export interface EvidenceAndRole {
  role: string;
  evidence: FindingEvidence;
}

interface GlobalIdentifier {
  identifierType: string;
  identifier: string;
  description: string;
  link: string;
}

interface Tag {
  key: string;
  value: string;
}

interface RawField {
  key: string;
  value: string;
}

interface SourceRawFinding {
  provider: Provider;
  serverKey: string;
  findingId: string;
  rawFields: RawField[];
  tags: Tag[];
  url: string;
}

interface Remediation {
  title?: string;
  descriptionMarkdown: string;
  links?: string[];
}

export type AssociatedObjectRole = 'Related' | 'Subject';

interface AssociatedObject {
  identifier: string;
  name: string;
  type: string;
  iPs: null | string[];
  assetTags: Tag[];
  importance?: string;
  status?: string;
  associatedObjectRole: AssociatedObjectRole;
  dataModelReference?: {
    identifier: string;
    repositoryKey: string;
    artifactMultiSourcedEntityKey: string;
  };
  referencedEntity?: {
    identifier: string;
    repositoryKey: string;
  };
}

export interface RemediationSuggestion {
  name: string;
  version: string;
  fixVersion: string;
  relativeFilePath: string;
}

interface Finding extends DependencyFinding {
  type: string;
  actors: { email: string; isStaff: boolean; name: string; type: string }[];
  foreignFindingStatus: string;
  foreignValidationStatus: string;
  cvssInfo: CvssInfo | null;
  impactDescription: string;
  evidence: EvidenceAndRole[];
  riskTriggerElementType: string;
  globalIdentifiers: GlobalIdentifier[];
  sourceRawFindings: Partial<SourceRawFinding>[];
  sourceProviders: Provider[];
  associatedObjects: AssociatedObject[];
  serverKeys: string[];
  assetCollectionKeys: string[];
  severity: string;
  repositoryKeys: string[];
  isAssociated: boolean;
  realizationTime: Date;
  updatedTime: Date;
  createdOnTime: Date;
  description: string;
  fixable: boolean;
  remediation: Remediation;
  links: { role: 'FindingDetails' | 'Other'; url: string }[];
  tags: Tag[];
  confidence: string;
  id: string;
  time: string;
  title: string;
  findingPrograms: { id: string; name: string; url: string }[];
  referencedBy: string;
  packageName: string;
  packageVersions?: string[];
  artifactName?: string;
  complianceFrameworkReferences: ComplianceFrameworkReference[];
  dependencyInfoPathsSummary?: DependencyInfoPathsSummary;
  artifactImageIdentifications: ArtifactImageIdentification[];
  remediationSuggestion: RemediationSuggestion[];
}

export interface LightweightFindingResponse {
  finding: Partial<Finding>;
  associatedObjects: AssociatedObject[];
  applications?: LeanApplication[];
  repositoryProfile?: LeanConsumableProfile;
}
