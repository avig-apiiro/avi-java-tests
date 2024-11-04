import styled from 'styled-components';
import { ApiiroQlInterpolatedStringEditor } from '@src-v2/components/apiiroql-interpolated-string-editor/apiiroql-interpolated-string-editor';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Divider as BaseDivider } from '@src-v2/components/divider';
import { SubHeading4 } from '@src-v2/components/typography';
import { getTargetObjectTypeFromGovernanceRuleTarget } from '@src-v2/containers/inventory-query/inventory-query-object-options';
import {
  EditableApiiroQlExpressionTokenizedString,
  SmartPolicyEntityQueryEditor,
} from '@src-v2/containers/smart-policy/smart-policy-entity-query-editor';
import { ApiiroQlSmartPolicyRule } from '@src-v2/types/governance/governance-rules';

export function SmartPolicyDisplayBlock({ rule }: { rule: ApiiroQlSmartPolicyRule }) {
  return (
    <AsyncBoundary>
      <SmartPolicyDisplayBlockContainer>
        <SmartPolicyEntityQueryEditor
          targetObjectType={getTargetObjectTypeFromGovernanceRuleTarget(rule.governanceRuleTarget)}
          entityPredicate={rule.riskQueryPredicateExpression}
        />
        <Divider />
        <DescriptionRow>
          <SubHeading4>Description:</SubHeading4>
          <ApiiroQlInterpolatedStringEditor
            value={rule.riskDescriptionExpression as EditableApiiroQlExpressionTokenizedString}
            readOnly={true}
            errors={[]}
          />
        </DescriptionRow>
      </SmartPolicyDisplayBlockContainer>
    </AsyncBoundary>
  );
}

const SmartPolicyDisplayBlockContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Divider = styled(BaseDivider)`
  margin: 6rem 1rem 3rem 1rem;
`;

const DescriptionRow = styled.div`
  line-height: 6rem;
  display: flex;
  flex-direction: row;
  align-items: center;
`;
