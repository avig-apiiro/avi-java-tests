import _ from 'lodash';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Chip } from '@src-v2/components/chips';
import { ClampText } from '@src-v2/components/clamp-text';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { selectComponents } from '@src-v2/components/select/select-components';
import { RiskChange } from '@src-v2/containers/workflow/types/types';
import { givenTypeToWhenTypes } from '@src-v2/containers/workflow/types/workflow-type-mappings';
import {
  WorkflowChip,
  WorkflowInputControl,
  WorkflowLabel,
  WorkflowSelectControl,
} from '@src-v2/containers/workflow/workflow-editor-controls';
import { useInject, useSuspense } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';

export const WhenTypeSelector = ({
  whenState,
  index,
  availableOptions,
  optionsSchema,
}: StubAny) => {
  const { setValue } = useFormContext();
  return (
    <WorkflowSelectControl
      key={whenState.type}
      defaultValue={whenState.type ?? availableOptions[0]}
      items={availableOptions}
      itemToString={(key: StubAny) => optionsSchema[key]?.displayName}
      name={`when[${index}].type`}
      onSelect={({ selectedItem }: StubAny) => {
        setValue(`when[${index}].value`, optionsSchema[selectedItem]?.defaultValue ?? null);
      }}
    />
  );
};

export const ServerOptionsControl = ({ index, optionsSchema }: StubAny) => {
  const options = givenTypeToWhenTypes.Server;
  const { watch } = useFormContext();
  const visibilityItems = optionsSchema[watch(`when.${index}.type`)]?.options;

  return (
    <>
      <WorkflowSelectControl
        defaultValue={_.first(options)}
        items={options}
        itemToString={(item: StubAny) =>
          item?.displayName ?? optionsSchema[item]?.displayName ?? ''
        }
        name={`when.${index}.type`}
      />
      <WorkflowLabel>with visibility</WorkflowLabel>
      <WorkflowSelectControl
        defaultValue={_.first(visibilityItems)}
        items={visibilityItems}
        itemToString={(item: StubAny) => item?.displayName ?? item ?? ''}
        name={`when.${index}.value`}
      />
    </>
  );
};

export const IssuesLabelControl = (props: StubAny) => {
  const { workflows } = useInject();
  const options = useSuspense(workflows.getWhenOptions, {
    type: 'IssueLabel',
  });

  return (
    <WorkflowSelectControl
      items={options}
      defaultValue={_.first(options)}
      placeholder="Add Issues"
      itemToString={(item: StubAny) =>
        item?.displayName ?? options.find(option => option?.displayName === item)?.displayName ?? ''
      }
      {...props}
    />
  );
};

export const RiskSelectControl = (props: StubAny) => {
  const options = props.optionsSchema?.Risk?.options;

  const itemToString = (item: StubAny) => item?.displayName ?? item ?? '';

  return (
    <WorkflowSelectControl
      {...props}
      placeholder="Select risks..."
      itemToString={itemToString}
      items={options}
      defaultValue={_.first(options)}
      chip={({ selectedItem, ...props }) => (
        <Chip key={selectedItem} {...props}>
          <RiskIcon riskLevel={itemToString(selectedItem)} />
          {selectedItem?.displayName ?? selectedItem}
        </Chip>
      )}
    />
  );
};

const RiskChangeOptionsDisplayNames: { [risk in RiskChange]: string | null } = {
  New: 'New risks',
  Existing: null,
  Resolved: 'Resolved risks',
};

const RiskChangeOptions = Object.entries(RiskChangeOptionsDisplayNames)
  .filter(([_, displayName]) => displayName !== null)
  .map(([key, displayName]) => ({ key, displayName }));

export const RiskChangeTypeSelectControl = (props: StubAny) => {
  const itemToString = (item: StubAny) => item?.displayName ?? item ?? '';

  return (
    <WorkflowSelectControl
      {...props}
      placeholder="Select risk change types..."
      itemToString={itemToString}
      items={RiskChangeOptions}
      defaultValue={_.first(RiskChangeOptions)}
      multiple
    />
  );
};

export const ChangeTypeSelectControl = (props: StubAny) => {
  const { workflows } = useInject();

  const options = useSuspense(workflows.getWhenOptions, {
    type: 'DiffBasedLabel',
  });

  return (
    <AsyncBoundary>
      <WorkflowSelectControl multiple items={options} defaultValue={options[0]} {...props} />
    </AsyncBoundary>
  );
};

export const ViolationSelectControl = styled(props => {
  const { workflows } = useInject();
  const options = useSuspense(workflows.getWhenOptions, {
    type: props.violationType,
  });
  const { watch } = useFormContext();
  const { invalidLabels, isReadonly } = watch();

  return (
    <AsyncBoundary>
      <SelectControlV2
        {...props}
        disabled={isReadonly}
        multiple
        options={options}
        clearable={false}
        fitMenuToContent
        components={{
          ...selectComponents,
          MultiValueContainer: ({ data, ...props }: StubAny) => (
            <WorkflowChip
              {...props}
              errorMessage={invalidLabels?.includes(String(data)) ? 'Invalid label' : ''}
            />
          ),
        }}
        filterOption={(option: StubAny, inputValue: StubAny) =>
          (getViolationDisplayName(option.data, options) ?? '')
            .toLowerCase()
            .includes((inputValue ?? '').toLowerCase())
        }
        label={({ data }: StubAny) => (
          <ClampText>{getViolationDisplayName(data, options)}</ClampText>
        )}
        option={({ data }: StubAny) => (
          <ClampText>{getViolationDisplayName(data, options)}</ClampText>
        )}
      />
    </AsyncBoundary>
  );
})`
  &[data-disabled] ${Chip} {
  {
    color: var(--color-blue-gray-70);
  }
`;

export const ScoreInput = styled(props => {
  return (
    <WorkflowInputControl
      {...props}
      rules={{
        validate: (input: StubAny) => !isNaN(input) || 'numeric values only!', // This allows numbers and numeric strings
      }}
    />
  );
})`
  max-width: 18rem;
`;

const getViolationDisplayName = (data: StubAny, options: StubAny) => {
  return (
    data?.displayName ??
    options.find((option: StubAny) => option?.key === data)?.displayName ??
    (typeof data === 'string' && data) ??
    ''
  );
};
