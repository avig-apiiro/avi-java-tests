import { useCallback, useMemo } from 'react';
import { Controller, RegisterOptions, useFormContext, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Dropdown } from '@src-v2/components/dropdown';
import { CalendarDatePicker } from '@src-v2/components/forms/calendar-date-picker';
import {
  InputControl,
  SelectControlV2,
  TextareaControl,
} from '@src-v2/components/forms/form-controls';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { SearchCombobox } from '@src-v2/containers/search-combobox';
import { useInject } from '@src-v2/hooks';
import { SearchParams } from '@src-v2/services';

type FieldBaseProps = { name: string; rules: RegisterOptions; placeholder: string };

export const FieldFactory = ({ field: { component: ComponentControl, required, ...field } }) => {
  const baseProps = useMemo<FieldBaseProps>(
    () => ({
      name: `fieldsValues.${field.key}`,
      rules: { required },
      placeholder: field.placeholder,
    }),
    [field]
  );

  if (ComponentControl) {
    return (
      <AsyncBoundary>
        <ComponentControl {...baseProps} />
      </AsyncBoundary>
    );
  }

  switch (field.type) {
    case 'select':
      return <SelectControlV2 {...baseProps} options={field.allowedValues} />;
    case 'textarea':
      return <TextareaControl {...baseProps} />;
    case 'number':
      return <InputControl {...baseProps} type="number" />;
    case 'string':
      return field.key === 'description' ? (
        <TextareaControl {...baseProps} />
      ) : (
        <InputControl {...baseProps} />
      );
    case 'date':
      return (
        <Controller
          {...baseProps}
          render={({ field }) => (
            <CalendarDatePicker selectRange={false} maxDate={null} {...field} />
          )}
        />
      );
    case 'user':
      return <UsersSelectControl {...baseProps} />;
    case 'users':
      return <UsersSelectControl multiple {...baseProps} />;
    case 'issuelink':
      return <IssuesSelectControl {...baseProps} isParentSearch={field.key === 'parent'} />;
    case 'array':
      return <CreatableControl {...baseProps} />;
    case 'any':
      return field.customFieldType === 'gh-epic-link' ? (
        <IssuesSelectControl {...baseProps} specificIssueTypes={['Epic']} />
      ) : (
        <InputControl {...baseProps} />
      );
    default:
      console.warn(`Unsupported field type: ${field.type}`);
      return <InputControl {...baseProps} />;
  }
};

export function UsersSelectControl({
  name,
  rules,
  placeholder,
  multiple,
  creatable,
}: FieldBaseProps & {
  multiple?: boolean;
  creatable?: boolean;
}) {
  const { projects } = useInject();

  const project = useWatch({ name: 'project' });

  const handleSearch = useCallback(
    ({ searchTerm }: SearchParams) => projects.searchUsers({ projectKey: project.key, searchTerm }),
    [projects, project]
  );

  return (
    <SelectControlV2
      placeholder={placeholder}
      creatable={creatable}
      multiple={multiple}
      name={name}
      rules={rules}
      searchMethod={handleSearch}
      formatOptionLabel={item => item?.displayName ?? item?.email ?? item?.label ?? item?.key}
    />
  );
}

export function IssuesSelectControl({
  name,
  rules,
  placeholder,
  creatable,
  specificIssueTypes,
  isParentSearch,
}: FieldBaseProps & {
  creatable?: boolean;
  specificIssueTypes?: string[];
  isParentSearch?: boolean;
}) {
  const { watch } = useFormContext();
  const { projects } = useInject();
  const [project, issueType] = watch(['project', 'issueType']);

  const handleSearch = useCallback(
    ({ searchTerm }) =>
      projects.searchIssues({
        projectKey: project?.key,
        searchTerm,
        specificIssueTypes,
        isParentSearch,
        issueType: issueType?.name,
      }),
    [projects, project]
  );

  return (
    <SelectControlV2
      placeholder={placeholder}
      creatable={creatable}
      name={name}
      rules={rules}
      formatOptionLabel={item => `${item?.key || ''} ${item?.summary || ''}`}
      searchMethod={handleSearch}
    />
  );
}

const CreatableControl = styled(({ name, rules, ...props }) => (
  <Controller
    name={name}
    rules={rules}
    render={({ field: { onChange, ...field } }) => (
      <SearchCombobox
        {...props}
        {...field}
        as={MultiSelect}
        creatable
        onSelect={event => onChange(event.selectedItems)}
      />
    )}
  />
))`
  ${Dropdown.List} {
    display: none;
  }
`;
