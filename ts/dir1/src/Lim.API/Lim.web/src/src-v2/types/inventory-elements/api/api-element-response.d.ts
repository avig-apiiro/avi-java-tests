import { CodeParsingTarget } from '@src-v2/types/code-parsing-target';
import { Language } from '@src-v2/types/enums/language';
import { RelatedEndpoint } from '@src-v2/types/inventory-elements/api/api-element';
import { ApiFindingsSummary } from '@src-v2/types/inventory-elements/api/api-findings-summary';
import { ApiGatewaySummary } from '@src-v2/types/inventory-elements/api/api-gateway-summary';
import { ApiSecurityControl } from '@src-v2/types/inventory-elements/api/api-security-control';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import {
  ApiCodeReference,
  CodeReference,
  NamedCodeReference,
} from '@src-v2/types/risks/code-reference';

export interface RelatedDataModelInfo {
  dataFieldName: string;
  codeReference: NamedCodeReference;
  types: ('PII' | 'Payments' | 'Custom' | 'PHI')[];
}

export interface ApiElementResponse extends BaseElement {
  codeReference: ApiCodeReference;
  apiFramework: string;
  apiControlsInfo: {
    type: ApiSecurityControl;
    description: string;
    codeReference: CodeReference;
  }[];
  involvedDataModels: RelatedDataModelInfo[];
  exposedDataModels: RelatedDataModelInfo[];
  apiFindingsSummaries: ApiFindingsSummary[];
  moduleName: string;
  language: keyof typeof Language;
  apiGatewaySummary: ApiGatewaySummary;
  isViolatingAuthorization: boolean;
  violatedInputValidationCodeParsingTarget: CodeParsingTarget;
  relatedEndpoints: RelatedEndpoint[];
}
