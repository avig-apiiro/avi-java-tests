import { Provider } from '@src-v2/types/enums/provider';
import { RelatedEndpoint } from '@src-v2/types/inventory-elements/api/api-element';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { ComplianceFrameworkReference } from '@src-v2/types/inventory-elements/code-findings';

export interface Finding extends BaseElement {
  key: string;
  type: string;
  description: string;
  url: string;
  reportUrl: string;
  time?: Date;
  cweIdentifiers: string[];
  tags: Record<string, string>;
  httpMethod: string;
  route: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody: string;
  responseBody: string;
  evidence: string;
  vulnerabilityType: string;
  remediation: string;
  links: string[];
  provider: Provider;
  lastScanTime?: Date;
  severity?: string;
  state?: string;
  firstDetectionTime: Date;
  latestDetectionTime: Date;
  complianceFrameworkReferences: ComplianceFrameworkReference[];
  relatedEndpoints: RelatedEndpoint[];
}

export interface ApiFindingsSummary {
  provider: Provider;
  reportUrl: string;
  url: string;
  lastScanTime?: Date;
  findings: Finding[];
}
