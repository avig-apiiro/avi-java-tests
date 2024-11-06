import { SensitiveDataType } from '@src-v2/types/enums/sensitive-data-type';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface SensitiveDataElement extends BaseElement {
  sensitiveDataTypes?: SensitiveDataType[];
}
