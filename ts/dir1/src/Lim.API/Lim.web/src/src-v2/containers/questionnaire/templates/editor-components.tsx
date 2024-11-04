import { ReactNode } from 'react';
import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { Card } from '@src-v2/components/cards';
import { Input } from '@src-v2/components/forms';
import { InputControl, SelectControl } from '@src-v2/components/forms/form-controls';

type EditorControlProps = {
  onClick: () => void;
  children?: ReactNode;
};

export const AddButton = styled(({ onClick, children, ...props }: EditorControlProps) => (
  <div onClick={onClick} {...props}>
    <IconButton name="PlusSmall" />
    {children}
  </div>
))`
  display: flex;
  padding-top: 4rem;
  gap: 2rem;
  align-items: center;
  cursor: pointer;

  ${IconButton} {
    color: var(--color-white);
    border-radius: 100vmax;
    background-color: var(--color-blue-gray-70);
    margin-left: 2rem;
  }

  &[data-add-section] {
    ${IconButton} {
      background-color: var(--color-purple-50);
      margin-left: 9rem;
      width: 8rem !important;
      height: 8rem !important;
    }
  }
`;
export const RemoveButton = ({ onClick }: EditorControlProps) => (
  <IconButton name="Trash" onClick={onClick} />
);
export const SectionTitleEditor = props => (
  <InputControl {...props} data-display placeholder="Title..." defalutValue="0" />
);

export const QuestionEditor = styled(Card)`
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 4rem;
  border-radius: 3rem;
  margin: 2rem;
  gap: 2rem;
`;

export const ConditionToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-left: 2rem;
`;

export const ConditionDetails = styled(ConditionToggle)`
  max-width: 300px;
`;

export const ScoreSelect = styled(({ name, ...props }) => (
  <SelectControl
    clearable={false}
    name={name}
    itemToString={item => `${item} pts`}
    items={Array.from({ length: 11 }, (_, i) => Number(i * 0.1).toFixed(1))}
    {...props}
  />
))`
  ${Input} {
    width: 25rem;
  }
`;

export const EditorRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
`;
