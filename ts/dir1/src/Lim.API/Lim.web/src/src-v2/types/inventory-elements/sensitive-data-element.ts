import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { CodeReference } from '@src-v2/types/risks/code-reference';

export interface ApiReference {
  apiClassification: string;
  codeReference: CodeReference & { className: string; methodSignature: string };
  entityId: string;
  httpMethod: string;
  httpRoute: string;
  methodName: string;
}

export enum SensitiveDataType {
  Pii = 'PII',
  Payments = 'Payments',
  Custom = 'Custom',
  Phi = 'PHI',
}

export interface SensitiveDataElement extends BaseElement {
  sensitiveDataTypes: Array<keyof typeof SensitiveDataType>;
  sensitiveDataDefinedTypes: SensitiveDataType[];
  sensitiveDataSource: string;
  involvingApiReferences: ApiReference[];
  exposingApiReferences: ApiReference[];
}
