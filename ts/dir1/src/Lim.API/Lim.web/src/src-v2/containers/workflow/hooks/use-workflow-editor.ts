import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { GivenType, Option, ThenType, WhenType } from '@src-v2/containers/workflow/types/types';
import { workflowOptions } from '@src-v2/containers/workflow/types/workflow-options';
import {
  givenTypeToThenTypes,
  givenTypeToWhenTypes,
} from '@src-v2/containers/workflow/types/workflow-type-mappings';
import { StubAny } from '@src-v2/types/stub-any';

export const useWorkflowEditor = ({ step = 'given' }: { step?: 'given' | 'when' | 'then' }) => {
  const { control, watch, setValue, resetField, reset, unregister } = useFormContext();
  const { remove, append } = useFieldArray({
    control,
    name: step,
  });

  const workflowState = watch();

  useEffect(() => {
    if (workflowState.given) {
      return;
    }
    setValue('given[0].type', 'MaterialChange', { shouldDirty: true });
    updateWorkflowType();
  }, []);

  const resetGivenField = (givenValue: GivenType) => {
    setValue('given[0].type', givenValue);
    setValue('given[0].subType', workflowOptions.given[givenValue]?.subTypes?.[0].key);
  };

  const resetWhenField = (givenValue: GivenType) => {
    const [{ whenType }] = givenTypeToWhenTypes[givenValue];
    setValue('when[0].type', whenType);
    setValue('when[0].value', workflowOptions.when[whenType]?.options?.[0]);
  };

  const resetThenField = (givenValue: GivenType) => {
    setValue('then[0].type', givenTypeToThenTypes[givenValue]?.[0]);
  };

  const updateWorkflowType = (workflowType: GivenType = 'MaterialChange') => {
    const currentWorkflowState = watch();
    reset({ ...currentWorkflowState, given: [], when: [], then: [] });
    resetGivenField(workflowType);
    resetWhenField(workflowType);
    resetThenField(workflowType);
  };

  const appendField = (type: GivenType | ThenType | WhenType, value: Option, index: number) => {
    append(value);
    setValue(`${step}[${index + 1}].type`, type);
    setValue(`${step}[${index + 1}].value`, value?.options?.[0]);
    setValue(
      `${step}[${index + 1}].additionalProperties`,
      value?.options?.[0].additionalProperties
    );
  };

  return {
    watch,
    workflowState,
    workflowType: workflowState.given?.[0]?.type,
    workflowSection: workflowState?.[step],
    updateWorkflowType,
    removeField: remove,
    appendField,
    setValue: (name: string, data: StubAny) => setValue(name, data, { shouldValidate: false }),
    control,
    resetField,
    workflowOptions,
    unregister,
    reset,
  };
};
