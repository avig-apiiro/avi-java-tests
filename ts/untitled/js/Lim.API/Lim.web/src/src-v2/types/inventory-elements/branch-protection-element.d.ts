import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

type BranchProtectionRuleType = 'Deletion' | 'ForcePush' | 'RequiredCodeReviewers';

export interface BranchProtectionElement extends BaseElement {
  ruleType: BranchProtectionRuleType;
  ruleValueInt: number | null;
  ruleValueBool: boolean | null;
}
