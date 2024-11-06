import { CodeFrameworkType } from '@src-v2/types/enums/code-framework-type';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface FrameworkUsageElement extends BaseElement {
  framework: string;
  isEncryptionUsage: boolean;
  suspectedAsTest: boolean;
  type: CodeFrameworkType;
  usageType: 'Dependency';
}
