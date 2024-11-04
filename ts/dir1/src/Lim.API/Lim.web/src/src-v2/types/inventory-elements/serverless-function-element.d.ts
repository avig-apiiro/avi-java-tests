import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface ServerlessFunctionElement extends BaseElement {
  functionKey: string;
  provider: string;
  triggerEvents: string[];
  runtime: string;
  iamRole: string;
  handlerIdentifier: string;
  region: string;
  stage: string;
}
