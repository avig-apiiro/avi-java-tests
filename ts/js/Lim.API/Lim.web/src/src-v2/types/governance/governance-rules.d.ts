import { EditableApiiroQlExpression } from '@src-v2/containers/smart-policy/smart-policy-entity-query-editor';
import {
  GivenSubType,
  GivenType,
  ThenType,
  WhenType,
} from '@src-v2/containers/workflow/types/types';
import { RiskCategory } from '@src-v2/types/enums/risk-category';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { ThenSubType } from '@src-v2/types/material-changes/material-changes';

export interface BaseConfiguration {
  key: string;
  name: string;
  description?: string;
  ordinalId: number;
  updatedBy?: string;
  createdBy?: string;
  lastDisabledBy?: string;
  isDisabled: boolean;
}

interface RulePortion<TType extends GivenType | WhenType | ThenType> {
  type: TType;
  subType: TType extends GivenType ? GivenSubType : TType extends ThenType ? ThenSubType : never;
  value: string;
  additionalProperties: {
    type: string;
    value: string;
  };
}

export interface GovernanceRule extends BaseConfiguration {
  type: string;
  given: RulePortion<GivenType>[];
  when: RulePortion<WhenType>[];
  then: RulePortion<ThenType>[];
}

export interface Definition extends BaseConfiguration {}

export type ComputationRuleTargetDiffable =
  | {
      type: 'diffable';
      diffableTypeName: string;
    }
  | {
      type: 'codeProfile';
      profileTypeName: string;
    }
  | {
      type: 'finding';
      findingTypeName: string;
    };

export type ComputationRuleTarget = ComputationRuleTargetDiffable;

export type ApiiroQlSmartPolicyRule = Omit<GovernanceRule, 'given' | 'when' | 'then'> & {
  type: 'apiiroQlPolicyRule';
  governanceRuleTarget: ComputationRuleTarget;
  riskQueryPredicateExpression: EditableApiiroQlExpression;
  configuredRiskLevel: keyof typeof RiskLevel;
  configuredRiskCategory: keyof typeof RiskCategory;
  riskDescriptionExpression: EditableApiiroQlExpression;
  configuredTags: string[];
};

export type EditableExpressionInterpolatedStringError = {
  componentIndex: number;
  expressionText: string;
  compilationErrorExpressionSourcePosition: number;
  compilationErrorExpressionSourceEndPosition: number;
  message: string;
};

export type EditableExpressionError = EditableExpressionInterpolatedStringError;
