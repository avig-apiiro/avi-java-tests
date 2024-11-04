import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { Dropdown } from '@src-v2/components/dropdown';
import { ConditionalProviderIcon, SvgIcon } from '@src-v2/components/icons';
import { useAdditionalProperties } from '@src-v2/containers/workflow/hooks/use-additional-properties';
import { useWorkflowEditor } from '@src-v2/containers/workflow/hooks/use-workflow-editor';
import { AdditionalProperties } from '@src-v2/containers/workflow/then/additional-propperties/addtional-properties';
import { ThenTypeMenu } from '@src-v2/containers/workflow/then/then-type-menu';
import { ThenValueControl } from '@src-v2/containers/workflow/then/then-value-control';
import {
  GivenType,
  ThenType,
  alwaysEnabledThenTypes,
  messagingProviders,
  scmProviders,
} from '@src-v2/containers/workflow/types/types';
import { givenTypeToThenTypes } from '@src-v2/containers/workflow/types/workflow-type-mappings';
import {
  AddStepMenu,
  RemoveButton,
  StepTitle,
  WorkflowField,
  WorkflowFieldActions,
  WorkflowStep,
  WorkflowStepContainer,
  WorkflowStepWrapper,
} from '@src-v2/containers/workflow/workflow-editor-controls';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

export const ThenSection = () => {
  const {
    workflowState: { then: thenFields },
    workflowType,
    appendField,
    removeField,
    workflowOptions: { then: optionsSchema },
    setValue,
  } = useWorkflowEditor({
    step: 'then',
  });

  const {
    application: { integrations, isFeatureEnabled },
  } = useInject();

  const isOptionEnabled = (item: ThenType): boolean => {
    if (alwaysEnabledThenTypes.includes(item)) {
      return true;
    }

    switch (item) {
      case 'Jira':
        return integrations?.connectedToJira;
      case 'Slack':
        return integrations?.connectedToSlack;
      case 'Teams':
        return integrations?.connectedToTeams;
      case 'GoogleChat':
        return integrations?.connectedToGoogleChat;
      case 'Github':
        return integrations?.connectedToGithub;
      case 'Gitlab':
        return integrations?.connectedToGitlab;
      case 'AzureDevops':
        return integrations?.connectedToAzureDevops;
      default:
        return false;
    }
  };

  const hiddenThenTypes = [
    !isFeatureEnabled(FeatureFlag.FailPullRequests) && 'FailPullRequest',
    !isFeatureEnabled(FeatureFlag.Questionnaires) && 'Questionnaire',
  ].filter(Boolean);

  const availableOptions = useMemo(
    () =>
      _.difference(
        givenTypeToThenTypes[workflowType as GivenType]?.filter(
          (type: StubAny) => !hiddenThenTypes.includes(type)
        ),
        (thenFields ?? []).map?.((field: StubAny) => field.type)
      ),
    [workflowType, (thenFields ?? []).map?.((field: StubAny) => field.type)]
  );

  return (
    <WorkflowStepWrapper>
      <StepTitle>Then</StepTitle>
      <WorkflowStepContainer>
        <WorkflowStep>
          {thenFields?.map?.((thenState: StubAny, index: number) => {
            const isLast = index === thenFields.length - 1;
            const hasMore = isLast && Boolean(availableOptions.length);

            return (
              <WorkflowField key={`${thenState.type}-${index}`}>
                <ThenSectionContent
                  workflowType={workflowType}
                  availableOptions={availableOptions}
                  thenState={thenState}
                  index={index}
                  optionsSchema={optionsSchema}
                  isThenTypeEnabled={isOptionEnabled}
                  setValue={setValue}
                />
                <WorkflowFieldActions>
                  {thenFields.length > 1 && <RemoveButton onClick={() => removeField(index)} />}
                  {hasMore && (
                    <AddStepMenu
                      data-disabled={dataAttr(!isLast)}
                      onClick={stopPropagation}
                      onItemClick={stopPropagation}>
                      {availableOptions.map((item: ThenType) => (
                        <Dropdown.Item
                          key={item}
                          disabled={!isOptionEnabled(item)}
                          onClick={() => appendField(item, optionsSchema[item], index)}>
                          <>
                            {optionsSchema[item]?.icon ? (
                              <SvgIcon name={optionsSchema[item]?.icon} />
                            ) : (
                              <ConditionalProviderIcon name={optionsSchema[item]?.provider} />
                            )}
                            {optionsSchema[item]?.displayName}
                          </>
                        </Dropdown.Item>
                      ))}
                    </AddStepMenu>
                  )}
                </WorkflowFieldActions>
              </WorkflowField>
            );
          })}
        </WorkflowStep>
      </WorkflowStepContainer>
    </WorkflowStepWrapper>
  );
};

const ThenSectionContent = ({
  workflowType,
  thenState,
  index,
  optionsSchema,
  availableOptions,
  setValue,
  isThenTypeEnabled,
}: StubAny) => {
  const stepName = `then[${index}]`;

  const typeSettings = {
    customSchema: optionsSchema[thenState.type]?.customSchema,
    messagingProvider: messagingProviders.includes(thenState.type),
    scmProvider: scmProviders.includes(thenState.type),
  };

  const { resetAdditionalProperties } = useAdditionalProperties(false, index);

  const resetThenState = useCallback(
    (type?: string) => {
      setValue(`${stepName}.subType`, null);
      setValue(`${stepName}.value`, optionsSchema[type]?.options?.[0] ?? '');
      resetAdditionalProperties(optionsSchema[type]?.additionalProperties ?? []);
    },
    [stepName]
  );

  useEffect(() => {
    //find the first enabled option and set it as the default
    if (!isThenTypeEnabled(thenState.type)) {
      setValue(
        `${stepName}.type`,
        givenTypeToThenTypes[workflowType as GivenType].find(option => isThenTypeEnabled(option))
      );
    }
  }, []);

  return (
    <>
      <ThenTypeMenu
        thenState={thenState}
        index={index}
        availableOptions={availableOptions}
        optionsSchema={optionsSchema}
        isThenTypeEnabled={isThenTypeEnabled}
        stepName={stepName}
        resetThenState={resetThenState}
      />
      <ThenValueControl
        index={index}
        optionsSchema={optionsSchema}
        typeSettings={typeSettings}
        workflowType={workflowType}
        thenState={thenState}
      />
      <AdditionalProperties
        thenState={{ index, ...thenState }}
        isCustomSchema={typeSettings.customSchema}
      />
    </>
  );
};
