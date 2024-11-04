import styled from 'styled-components';
import { LabelToggle } from '@src-v2/components/forms';
import { SubHeading4 } from '@src-v2/components/typography';
import { Operator } from '@src-v2/hooks/use-filters';

type FilterOperationSwitchProps = {
  activeOperator: Operator;
  supportedOperators: Operator[];
  onChange: (operator: Operator) => void;
};

export const FilterOperatorSwitch = ({
  activeOperator,
  supportedOperators,
  onChange,
}: FilterOperationSwitchProps) => (
  <OperatorSwitchContainer>
    Filter behavior:
    <LabelToggle labels={supportedOperators} defaultLabel={activeOperator} onChange={onChange} />
  </OperatorSwitchContainer>
);

const OperatorSwitchContainer = styled(SubHeading4)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  gap: 4rem;
`;
