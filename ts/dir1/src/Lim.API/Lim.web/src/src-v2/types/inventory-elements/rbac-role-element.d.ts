import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import {
  ApiCodeReference,
  CodeReference,
  NamedCodeReference,
} from '@src-v2/types/risks/code-reference';

export type RbacType = 'Swagger' | 'MethodAuthorization' | 'SecurityConfiguration';

export interface RbacRoleElement extends BaseElement {
  usageIndications: {
    rbacType: RbacType;
    usages: (ApiCodeReference | NamedCodeReference)[];
  }[];
}
