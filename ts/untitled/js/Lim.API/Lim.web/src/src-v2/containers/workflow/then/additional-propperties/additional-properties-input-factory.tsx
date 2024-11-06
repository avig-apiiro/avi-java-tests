import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ClampText } from '@src-v2/components/clamp-text';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { useWorkflowEditor } from '@src-v2/containers/workflow/hooks/use-workflow-editor';
import { SearchContributorsControl } from '@src-v2/containers/workflow/then/then-controls';
import {
  WorkflowInputControl,
  WorkflowLabel,
  WorkflowSelectControl,
} from '@src-v2/containers/workflow/workflow-editor-controls';
import { useInject, useSuspense } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { humanize } from '@src-v2/utils/string-utils';

interface AdditionalPropertiesInputFactoryProps {
  propertySettings: { type: 'text' | 'select' };
  propertyKey: 'Assignee' | 'fallback' | 'AssignTitle' | 'DataContext' | 'System.AreaPath';
  thenItem: { [x: string]: any };
  name: string;
  initialValue: any;
}

export const AdditionalPropertiesInputFactory = ({
  propertySettings,
  propertyKey,
  thenItem,
  ...props
}: AdditionalPropertiesInputFactoryProps) => {
  const property = normalizeAdditionalProperties(propertySettings);

  if (propertyKey === 'fallback') {
    return (
      <>
        <WorkflowLabel>Fallback to</WorkflowLabel>
        <AsyncBoundary>
          <SearchContributorsControl {...props} name={`${props.name}.value`} />
        </AsyncBoundary>
      </>
    );
  }

  if (propertyKey === 'Assignee' && thenItem.type !== 'AzureDevops' && thenItem.type !== 'Gitlab') {
    return (
      <>
        <WorkflowLabel>Assign to</WorkflowLabel>
        <AsyncBoundary>
          <SearchProjectContributorsControl
            {...props}
            name={`${props.name}.value`}
            thenItem={thenItem}
          />
        </AsyncBoundary>
      </>
    );
  }

  if (propertyKey === 'AssignTitle') {
    return (
      <>
        <WorkflowLabel>Assign to</WorkflowLabel>
        <AsyncBoundary>
          <JobTitleSelector {...props} name={`${props.name}.value`} thenItem={thenItem} />
        </AsyncBoundary>
      </>
    );
  }

  if (property && propertyKey === 'DataContext') {
    return <DataContextSelect {...props} property={property} />;
  }

  if (propertyKey === 'System.AreaPath') {
    return <AreaPathSelect {...props} property={property} name={`${props.name}.value`} />;
  }

  switch (property?.type) {
    case 'select':
      return (
        <>
          <WorkflowLabel data-required={dataAttr(property.required)}>
            {property.displayName}
          </WorkflowLabel>
          <WorkflowSelectControl
            placeholder={getPlaceholder(property, 'Select')}
            items={property.options}
            itemToString={(item: StubAny) =>
              item?.displayName ??
              property?.options.find((option: StubAny) => option?.key === item)?.displayName
            }
            name={`${props.name}.value`}
          />
        </>
      );

    case 'text':
    case 'multi-line':
      return (
        <>
          <WorkflowLabel data-required={dataAttr(property.required)}>
            {property.displayName}
          </WorkflowLabel>

          <WorkflowInputControl
            itemToString={(item: StubAny) => item.value}
            placeholder={getPlaceholder(property)}
            name={`${props.name}.value`}
          />
        </>
      );
    case 'password':
      return (
        <>
          <WorkflowLabel data-required={dataAttr(property.required)}>
            {property.displayName}
          </WorkflowLabel>

          <WorkflowInputControl
            type="password"
            itemToString={(item: StubAny) => item.value}
            placeholder="Add password"
            name={`${props.name}.value`}
          />
        </>
      );
    case 'labelOnly':
      return (
        <WorkflowLabel data-required={dataAttr(property.required)}>
          {property.displayName}
        </WorkflowLabel>
      );

    default:
      return (
        <WorkflowLabel>
          <LogoSpinner />
        </WorkflowLabel>
      );
  }
};

const normalizeAdditionalProperties = (propertySettings: StubAny) => {
  if (propertySettings?.type === 'select' && !propertySettings?.options) {
    return { ...propertySettings, type: 'text' };
  }
  if (propertySettings?.options) {
    return { ...propertySettings, type: 'select' };
  }
  return propertySettings;
};

export const SearchProjectContributorsControl = ({ name, thenItem, ...props }: StubAny) => {
  const { workflows } = useInject();
  const [items, setItems] = useState([]);
  const { watch, setValue } = useFormContext();
  const devKey = watch(name);
  const [searchTerm, setSearchTerm] = useState('');

  const initialValue = useSuspense(workflows.getProjectUser, {
    searchTerm: devKey,
    projectKey: thenItem.subType?.key ?? thenItem.subType ?? thenItem.value.key,
  });
  useEffect(() => {
    const updateUsers = async () => {
      const newItems = await workflows.getProjectUsers({
        searchTerm,
        projectKey: thenItem.subType?.key ?? thenItem.subType ?? thenItem.value?.key,
      });

      setItems(newItems || []);
    };
    updateUsers();
  }, [searchTerm, thenItem, watch(`${name}.value`)]);

  return (
    <WorkflowSelectControl
      {...props}
      onChange={(e: any) => setSearchTerm(e.target.value)}
      onFocus={() => setSearchTerm('')}
      onSelect={({ selectedItem }: StubAny) =>
        setValue(name, selectedItem?.email ?? selectedItem?.key)
      }
      itemToString={(item: StubAny) =>
        item?.displayName ?? item?.email ?? item?.key ?? item?.toString() ?? ''
      }
      name={name}
      placeholder="Search for a contributor"
      items={items}
      defaultValue={initialValue}
    />
  );
};

const JobTitleSelector = ({ name, ...props }: StubAny) => {
  const { setValue } = useFormContext();
  const { contributors } = useInject();
  const jobTitles = useSuspense(contributors.getPointsOfContactTypes);
  return (
    <WorkflowSelectControl
      {...props}
      itemToString={(item: StubAny) => item?.label ?? item?.value ?? humanize(item) ?? ''}
      name={name}
      onSelect={({ selectedItem }: StubAny) => setValue(name, selectedItem?.value)}
      placeholder="Assign a point of contact"
      items={jobTitles}
    />
  );
};

const DataContextSelect = ({ property, name, ...props }: StubAny) => {
  const { setValue, watch } = useWorkflowEditor({ step: 'then' });
  const value = watch(`${name}.value`);

  if (Array.isArray(value) && value.length === 1 && !value[0]) {
    setValue(`${name}.value`, []);
  }

  return (
    <>
      <WorkflowLabel data-required={dataAttr(property.required)}>
        {property.displayName}
      </WorkflowLabel>
      <SelectControlV2
        {...props}
        multiple
        clearable={false}
        placeholder={getPlaceholder(property, 'Select')}
        options={property.options}
        formatOptionLabel={(item: StubAny) =>
          item?.displayName ??
          property?.options.find((option: StubAny) => option?.key === item)?.displayName
        }
        name={`${name}.value`}
        onChange={(selectedItems: StubAny) => {
          const newItems = selectedItems.map((item: StubAny) => ({
            type: 'DataContext',
            key: item.key ?? item,
            value: item.key ?? item,
            displayName: item.displayName ?? item,
          }));
          setValue(`${name}.value`, newItems);
        }}
      />
    </>
  );
};

//TODO fix backend to return cleaner values LIM-23256 so we dont need this ugly function
const getPlaceholder = (property: StubAny, prefix = 'Add') =>
  humanize(
    property.displayName.includes('Add')
      ? property.displayName
      : `${prefix} ${property.displayName}...`
  );

const AreaPathSelect = styled(props => (
  <AsyncBoundary>
    <WorkflowLabel>Area path</WorkflowLabel>
    <SelectControlV2
      {...props}
      option={({ data }: StubAny) => (
        <AreaPathSelectOption>
          <ClampText>{data.displayName}</ClampText>
        </AreaPathSelectOption>
      )}
      placeholder="Select an area path..."
      formatOptionLabel={(data: StubAny) => data.displayName}
      options={props.property.options}
      fitMenuToContent
    />
  </AsyncBoundary>
))``;

const AreaPathSelectOption = styled.div`
  width: 60rem;
`;
