import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface ProcessTag {
  key: string;
  name: string;
  type: 'SecurityReview' | 'ComplianceReview' | 'PenTest' | 'ThreatModel';
  processName: string;
}

interface CodeOwnerEntity {
  identityKey: string;
  activity: 'Inactive' | 'Active' | 'ActiveInRepo';
}

interface IssueRiskPrediction {
  contentHash: string;
  category: string;
  confidence: number;
  reasoning: string;
  securityReviewQuestions: string;
  threatModel: string;
  revision: number;
  updateTime: string;
}

export interface RiskyIssue extends BaseElement {
  id: string;
  key: string;
  title: string;
  description: string;
  definitionKeys: string[];
  projectKey: string;
  type: string;
  creationTime: Date;
  processTags: ProcessTag[];
  riskHints?: string[];
  externalUrl: string;
  assigneeIdentitiesKeysToActivityTime: Record<string, Date>;
  labels: string[];
  components: string[];
  codeOwnerEntity: CodeOwnerEntity;
  repositoryKeys: string[];
  attackSurfaceCount: number;
  assigneeProfiles?: any[];
  issueRiskPrediction: IssueRiskPrediction;
}
