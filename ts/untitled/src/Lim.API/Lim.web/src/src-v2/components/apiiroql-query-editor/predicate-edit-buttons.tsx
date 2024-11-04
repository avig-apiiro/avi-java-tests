import styled from 'styled-components';
import { DeleteButton } from '@src-v2/components/buttons';
import { SvgIcon } from '@src-v2/components/icons';

export const PredicateDeleteButton = styled(DeleteButton)``;

export function PredicateOrOperatorButton(props) {
  return (
    <OperatorButton data-operator="or" {...props}>
      + OR
    </OperatorButton>
  );
}

export function PredicateAndOperatorButton(props) {
  return (
    <OperatorButton data-operator="and" {...props}>
      + AND
    </OperatorButton>
  );
}

export function AddAggregationOperatorButton(props) {
  return (
    <PredicateEditButton {...props}>
      <AddAggregationOperatorButtonIcon name="PlusSmall" />
    </PredicateEditButton>
  );
}

const AddAggregationOperatorButtonIcon = styled(SvgIcon)`
  color: var(--color-white);
  border-radius: 100vmax;
  background-color: var(--color-blue-gray-70);
`;

export const PredicateEditButton = styled.span`
  background: none;
  color: var(--color-blue-gray-50);
  border-radius: 100vh;
  text-transform: uppercase;
  font-size: 3rem;
  line-height: 3rem;
  font-weight: normal;
  flex-shrink: 0;
  user-select: none;
`;

export const SubPredicateAddButton = styled(PredicateEditButton)`
  color: white;
  padding: 1rem 3rem;
  margin: 1.5rem 0 4.5rem 0;
  background: var(--color-blue-gray-40);

  &:hover {
    background: var(--color-blue-gray-45);
  }
`;

const OperatorButton = styled(PredicateEditButton)`
  color: white;
  padding: 1rem 3rem;

  background: var(--color-blue-gray-40);
  &:hover {
    background: var(--color-blue-gray-45);
  }

  &[data-operator='and'] {
    background-color: var(--color-blue-60);
  }

  &[data-operator='and']:hover {
    background-color: var(--color-blue-65);
  }

  &[data-operator='or'] {
    background-color: var(--color-green-55);
  }

  &[data-operator='or']:hover {
    background-color: var(--color-green-60);
  }
`;
