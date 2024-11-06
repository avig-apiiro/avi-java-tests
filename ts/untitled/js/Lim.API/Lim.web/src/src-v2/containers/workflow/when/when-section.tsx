import { ReactElement, useMemo } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Dropdown } from '@src-v2/components/dropdown';
import { useWorkflowEditor } from '@src-v2/containers/workflow/hooks/use-workflow-editor';
import { GivenType, WhenType } from '@src-v2/containers/workflow/types/types';
import { workflowOptions } from '@src-v2/containers/workflow/types/workflow-options';
import { permissibleWhenTypes } from '@src-v2/containers/workflow/types/workflow-type-mappings';
import {
  ChangeTypeSelectControl,
  IssuesLabelControl,
  RiskChangeTypeSelectControl,
  RiskSelectControl,
  ScoreInput,
  ServerOptionsControl,
  ViolationSelectControl,
  WhenTypeSelector,
} from '@src-v2/containers/workflow/when/when-controls';
import {
  AddStepMenu,
  RemoveButton,
  StepTitle,
  WorkflowField,
  WorkflowFieldActions,
  WorkflowLabel,
  WorkflowStep,
  WorkflowStepContainer,
  WorkflowStepWrapper,
} from '@src-v2/containers/workflow/workflow-editor-controls';
import { useInject } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

export const WhenSection = () => {
  const {
    workflowState: { when: whenFields },
    workflowType,
    workflowOptions: { when: optionsSchema },
    appendField,
    removeField,
  } = useWorkflowEditor({
    step: 'when',
  });

  const { application } = useInject();

  const whenFieldTypes = whenFields?.map((field: StubAny) => field.type).join();

  const availableOptions = useMemo(
    () =>
      workflowType &&
      permissibleWhenTypes(
        application,
        workflowType,
        whenFields?.map((field: StubAny) => field.type) || []
      ),
    [workflowType, whenFieldTypes]
  );

  return (
    <WorkflowStepWrapper>
      <StepTitle>When</StepTitle>
      <WorkflowStepContainer>
        <WorkflowStep>
          {whenFields?.map((whenState: StubAny, index: number) => {
            const isLast = index === whenFields.length - 1;
            const hasMore = isLast && Boolean(availableOptions.length);

            const validWhenTypesForField =
              workflowType &&
              permissibleWhenTypes(
                application,
                workflowType,
                whenFields
                  ?.filter((whenField: StubAny) => whenField !== whenState)
                  .map((field: StubAny) => field.type) || []
              );

            return (
              <WorkflowField key={index}>
                <WhenSectionContent
                  workflowType={workflowType}
                  optionsSchema={optionsSchema}
                  whenState={whenState}
                  index={index}
                  availableOptions={validWhenTypesForField}
                />
                <WorkflowFieldActions>
                  {hasMore && (
                    <AddStepMenu
                      data-disabled={dataAttr(!isLast)}
                      onClick={stopPropagation}
                      onItemClick={stopPropagation}>
                      {availableOptions.map(item => (
                        <Dropdown.Item
                          key={item}
                          onClick={() => appendField(item, optionsSchema[item], index)}>
                          {optionsSchema[item]?.displayName}
                        </Dropdown.Item>
                      ))}
                    </AddStepMenu>
                  )}
                  {whenFields.length > 1 && <RemoveButton onClick={() => removeField(index)} />}
                </WorkflowFieldActions>
              </WorkflowField>
            );
          })}
        </WorkflowStep>
      </WorkflowStepContainer>
    </WorkflowStepWrapper>
  );
};

type WhenSectionContentProps = {
  optionsSchema: typeof workflowOptions.when;
  whenState: { type: WhenType; value: string };
  workflowType: GivenType;
  index: number;
  availableOptions: WhenType[];
};

const WhenSectionContent = ({
  optionsSchema,
  whenState,
  workflowType,
  index,
  availableOptions,
}: WhenSectionContentProps) => {
  switch (workflowType) {
    case 'Issue':
      return (
        <>
          <WorkflowLabel> change </WorkflowLabel>
          <WorkflowLabel>in</WorkflowLabel>
          <AsyncBoundary>
            <IssuesLabelControl step="when" key={whenState.type} name={`when.${index}.value`} />
          </AsyncBoundary>
        </>
      );

    case 'Server':
      return <ServerOptionsControl optionsSchema={optionsSchema} index={index} />;

    // no default
  }

  const WhenTypeControlRenderer = WhenTypeControlRenderers[whenState.type];
  if (!WhenTypeControlRenderer) {
    console.warn('Unknown when type', whenState.type);
    return null;
  }

  return (
    <>
      <WhenTypeSelector
        whenState={whenState}
        index={index}
        availableOptions={availableOptions}
        optionsSchema={optionsSchema}
      />
      <WhenTypeControlRenderer
        whenState={whenState}
        index={index}
        availableOptions={availableOptions}
        workflowType={workflowType}
        optionsSchema={optionsSchema}
      />
    </>
  );
};

const WhenTypeControlRenderers: {
  [whenType in WhenType]: (props: WhenSectionContentProps) => ReactElement;
} = {
  GovernanceViolationRisk: ({ optionsSchema, index }) => (
    <>
      <WorkflowLabel>is</WorkflowLabel>
      <RiskSelectControl optionsSchema={optionsSchema} name={`when[${index}].value`} multiple />
    </>
  ),
  Risk: ({ optionsSchema, index }) => (
    <>
      <WorkflowLabel>is</WorkflowLabel>
      <RiskSelectControl optionsSchema={optionsSchema} name={`when[${index}].value`} multiple />
    </>
  ),

  GovernanceViolationTag: ({ whenState, index }) => (
    <>
      <WorkflowLabel>is</WorkflowLabel>
      <ViolationSelectControl
        key={`when.${index}-${whenState.type}-${whenState.value}`}
        placeholder="Select policy tag.."
        itemToString={(item: StubAny) => item?.displayName ?? item ?? ''}
        violationType={whenState.type}
        name={`when[${index}].value`}
      />
    </>
  ),

  QuestionnaireScore: ({ whenState, index }) => (
    <>
      <WorkflowLabel>is</WorkflowLabel>
      <ScoreInput
        key={`when.${index}-${whenState.type}-${whenState.value}`}
        name={`when[${index}].value`}
        autoFocus
        placeholder="#"
      />
    </>
  ),

  DiffBasedLabel: ({ whenState, index }) => (
    <>
      <WorkflowLabel>is</WorkflowLabel>
      <ChangeTypeSelectControl
        key={`when.${index}-${whenState.type}-${whenState.value}`}
        placeholder="Select change type.."
        itemToString={(item: StubAny) => item?.displayName ?? item ?? ''}
        name={`when[${index}].value`}
      />
    </>
  ),

  GovernanceViolationName: ({ whenState, index }) => (
    <>
      <WorkflowLabel>is</WorkflowLabel>
      <ViolationSelectControl
        violationType={whenState.type}
        key={`when.${index}-${whenState.type}-${whenState.value}`}
        placehholder="Select change type.."
        name={`when[${index}].value`}
        itemToString={(item: StubAny) => item?.displayName ?? item ?? ''}
      />
    </>
  ),

  RiskChangeType: ({ whenState, index }) => (
    <>
      <WorkflowLabel>is</WorkflowLabel>
      <RiskChangeTypeSelectControl
        key={`when.${index}-${whenState.type}-${whenState.value}`}
        placeholder="Select risk change types..."
        name={`when[${index}].value`}
      />
    </>
  ),

  IssueLabel: null,
  NewProject: null,
  NewRepository: null,
};
