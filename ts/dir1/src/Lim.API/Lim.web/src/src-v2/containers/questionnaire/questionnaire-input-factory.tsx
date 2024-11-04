import styled from 'styled-components';
import { Combobox } from '@src-v2/components/forms';
import {
  CheckboxGroupControl,
  InputControl,
  RadioGroupControl,
  RemoteSelectControl,
  SelectControl,
} from '@src-v2/components/forms/form-controls';
import { Question } from '@src-v2/types/queastionnaire/questionnaire-response';
import { StyledProps } from '@src-v2/types/styled';

type QuestionType = 'text' | 'singleselect' | 'multiselect' | 'select' | 'search';

interface EditorValue {
  type: QuestionType;
  options: string[];
}

export const QuestionnaireInputFactory = ({
  type,
  answer = [],
  options,
  disabled = false,
  id,
  ...props
}: Pick<Question, 'type' | 'answer' | 'options' | 'id'> & {
  disabled: boolean;
}) => {
  switch (type) {
    case 'text':
      return <InputControlQuestion {...props} name={id} answer={answer?.[0]} disabled={disabled} />;
    case 'singleselect':
      return (
        <RadioSelectQuestion
          name={id}
          options={options.map(option => option.value)}
          answer={answer?.[0]}
          disabled={disabled}
          {...props}
        />
      );
    case 'multiselect':
      return (
        <CheckboxSelectQuestion
          name={id}
          options={options.map(option => option.value)}
          answer={answer}
          disabled={disabled}
          {...props}
        />
      );
    default:
      console.warn("Question type doesn't exist");
      return null;
  }
};

export const InputControlQuestion = ({
  answer,
  disabled = false,
  ...props
}: {
  answer?: string;
  defaultValue?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  rules?: { pattern?: { value: RegExp; message: string } };
}) => <InputControl {...props} disabled={disabled} />;

const RadioSelectQuestion = styled(
  ({
    options,
    answer,
    rules,
    defaultValue,
    ...props
  }: StyledProps<{
    name: string;
    options: string[];
    answer?: string;
    rules?: string[];
    defaultValue?: string;
    disabled: boolean;
  }>) => <RadioGroupControl {...props} options={options} />
)`
  gap: 2rem;
  margin-top: 1rem;
`;

const CheckboxSelectQuestion = styled(
  ({
    options,
    answer,
    editorValue,
    ...props
  }: StyledProps<{
    name: string;
    editorValue?: EditorValue;
    options: string[];
    answer?: string[];
    defaultValues?: string[];
    disabled: boolean;
  }>) => (
    <CheckboxGroupControl
      {...props}
      options={options.map(option => ({
        value: option,
        label: option,
      }))}
    />
  )
)`
  gap: 2rem;
  font: var(--color-blue-gray-70) 14px;
  font-weight: 300;
`;

export const SearchInputQuestion = styled(
  ({
    disabled,
    multiple = true,
    searchMethod,
    ...props
  }: {
    name: string;
    disabled?: boolean;
    multiple?: boolean;
    placeholder?: string;
    searchMethod: () => Promise<string>;
  }) => (
    <RemoteSelectControl
      {...props}
      multiple={multiple}
      disabled={disabled}
      searchMethod={searchMethod}
    />
  )
)`
  ${Combobox} {
    display: flex;
    font-size: var(--font-size-xs);
    color: black;
    min-width: 40rem;
    flex-grow: 0;
    flex-wrap: nowrap;
  }
`;

export const SelectInputQuestion = styled(props => <SelectControl {...props} />)`
  width: 100%;
`;
