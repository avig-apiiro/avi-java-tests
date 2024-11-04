import { useMemo } from 'react';
import {
  ApplicationSearchControl,
  ProjectsSearchControl,
  QuestionnaireTemplateSearchControl,
  RepositorySearchControl,
  ServerSearchControl,
  TeamSearchControl,
} from '@src-v2/containers/workflow/given/given-controls';
import { useWorkflowEditor } from '@src-v2/containers/workflow/hooks/use-workflow-editor';
import { GivenSubType, GivenType } from '@src-v2/containers/workflow/types/types';
import { givenTypes } from '@src-v2/containers/workflow/types/workflow-type-mappings';
import {
  StepTitle,
  WorkflowField,
  WorkflowLabel,
  WorkflowSelectControl,
  WorkflowStep,
  WorkflowStepContainer,
  WorkflowStepWrapper,
} from '@src-v2/containers/workflow/workflow-editor-controls';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';

export const GivenSection = () => {
  const {
    workflowState: { given },
  } = useWorkflowEditor({
    step: 'given',
  });

  return (
    <WorkflowStepWrapper>
      <StepTitle>Given</StepTitle>
      <WorkflowStepContainer>
        <WorkflowStep>
          {given?.map((givenState: StubAny, index: number) => (
            <WorkflowField key={`${givenState.type}-${index}`}>
              <GivenSectionContent givenState={givenState} key={givenState.type} index={index} />
            </WorkflowField>
          ))}
        </WorkflowStep>
      </WorkflowStepContainer>
    </WorkflowStepWrapper>
  );
};

const GivenSectionContent = ({ index, givenState }: { index: number; givenState: StubAny }) => {
  const givenTypeName = `given.${index}.type`;
  const givenSubtypeName = `given.${index}.subType`;
  const givenValueName = `given.${index}.value`;

  const {
    updateWorkflowType,
    workflowOptions: { given: options },
    setValue,
    unregister,
  } = useWorkflowEditor({
    step: 'given',
  });

  const { application } = useInject();

  const getSubtypeDisplayName = (subTypes: StubAny[], item: string) => {
    return subTypes.find(({ key }) => key === item)?.displayName;
  };

  const subTypes = useMemo(
    () => options[givenState.type as keyof typeof options]?.subTypes?.map(({ key }) => key),
    [options, givenState.type]
  );

  const hiddenGivenTypes = [
    !application.isFeatureEnabled(FeatureFlag.Questionnaire) && 'QuestionnaireCompleted',
    !application.isFeatureEnabled(FeatureFlag.WorkflowsV2) && 'RiskAdded',
    !application.isFeatureEnabled(FeatureFlag.WorkflowsV2) && 'RiskResolved',
  ].filter(Boolean);

  return (
    <>
      <WorkflowSelectControl
        name={givenTypeName}
        multiple={false}
        defaultValue={givenState.type}
        items={givenTypes.filter(type => !hiddenGivenTypes.includes(type))}
        itemToString={(item: keyof typeof options) => options[item]?.displayName}
        onSelect={({ selectedItem }: { selectedItem: StubAny }) => {
          updateWorkflowType(selectedItem);
        }}
      />
      <WorkflowLabel>in</WorkflowLabel>
      {Boolean(subTypes?.length > 0) && (
        <WorkflowSelectControl
          multiple={false}
          name={givenSubtypeName}
          defaultValue={givenState.subType}
          itemToString={(item: StubAny) =>
            getSubtypeDisplayName(options[givenState.type as keyof typeof options]?.subTypes, item)
          }
          items={subTypes}
          onSelect={({ selectedItem }: { selectedItem: StubAny }) => {
            if (selectedItem === 'Any') {
              unregister(givenValueName);
            } else {
              setValue(givenValueName, []);
            }
          }}
        />
      )}
      <GivenValueControl givenState={givenState} givenValueName={givenValueName} />
    </>
  );
};

const GivenValueControl = ({
  givenState,
  givenValueName,
}: {
  givenState: { type: GivenType; subType: GivenSubType };
  givenValueName: string;
}) => {
  if (givenState.type === 'Server') {
    return <ServerSearchControl name={givenValueName} />;
  }
  switch (givenState.subType) {
    case 'Project':
      return <ProjectsSearchControl name={givenValueName} />;

    case 'Repository':
      return <RepositorySearchControl name={givenValueName} />;

    case 'QuestionnaireTemplate':
      return <QuestionnaireTemplateSearchControl name={givenValueName} />;

    case 'AssetCollection':
      return <ApplicationSearchControl name={givenValueName} />;

    case 'Team':
      return <TeamSearchControl name={givenValueName} />;

    default:
      console.warn(`Unknown given type: ${givenState.type}`);
      return null;
  }
};
