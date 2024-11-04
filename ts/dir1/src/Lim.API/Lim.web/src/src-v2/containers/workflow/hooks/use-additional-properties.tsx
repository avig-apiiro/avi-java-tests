import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { useWorkflowEditor } from '@src-v2/containers/workflow/hooks/use-workflow-editor';
import { StubAny } from '@src-v2/types/stub-any';

export const useAdditionalProperties = (isCustomSchema: boolean, index: number) => {
  const {
    workflowState: { then },
    workflowOptions: { then: optionsSchema },
    setValue,
  } = useWorkflowEditor({
    step: 'then',
  });

  const { remove, append } = useFieldArray({
    name: `then[${index}].additionalProperties`,
  });

  const thenState = then[index];
  const selectedAdditionalProperties: StubAny[] = thenState.additionalProperties;
  const allAdditionalProperties: StubAny[] = isCustomSchema
    ? thenState.value?.additionalProperties ?? []
    : optionsSchema[thenState.type as keyof typeof optionsSchema]?.additionalProperties;

  const removeNonMultiDuplicates = useMemo(
    () => (additionalPropertiesToDisplay: StubAny[]) => {
      const multiProperties = new Set(
        allAdditionalProperties?.filter(prop => prop?.multi).map(prop => prop?.key) || []
      );

      return additionalPropertiesToDisplay.reduce((filtered, prop) => {
        if (!filtered.includes(prop) || multiProperties.has(prop)) {
          filtered.push(prop);
        }
        return filtered;
      }, []);
    },
    [allAdditionalProperties]
  );

  const additionalPropertiesToDisplay = useMemo(
    () =>
      removeNonMultiDuplicates([
        ...(selectedAdditionalProperties?.map(prop => ({
          key: prop?.type,
          uniqueKey: prop?.uniqueKey ?? crypto.randomUUID(),
        })) ?? []),
      ]),
    [selectedAdditionalProperties]
  );

  const multiProperties = useMemo(
    () =>
      new Set(allAdditionalProperties?.filter(({ multi }) => multi)?.map(({ key }) => key) || []),
    [allAdditionalProperties]
  );

  const usedNonMultiProperties = useMemo(
    () =>
      [
        ...(selectedAdditionalProperties ?? []).map(({ type }) => type),
        ...(additionalPropertiesToDisplay ?? []),
      ].filter(prop => !multiProperties.has(prop)),
    [selectedAdditionalProperties, additionalPropertiesToDisplay]
  );

  const availableOptions = useMemo(
    () =>
      _.difference(allAdditionalProperties?.map(({ key }) => key) ?? [], usedNonMultiProperties),
    [allAdditionalProperties, usedNonMultiProperties]
  );

  const resetAdditionalProperties = useCallback(
    (
      nextAdditionalProperties:
        | {
            key: string;
            required: boolean;
          }[]
        | undefined
    ) => {
      setValue(
        `then[${index}].additionalProperties`,
        (nextAdditionalProperties ?? [])
          .filter(prop => prop?.required)
          .map(prop => ({ type: prop.key, value: '', uniqueKey: crypto.randomUUID() }))
      );
    },
    [index, setValue]
  );

  const addAdditionalProperty = useCallback(
    (key: string) =>
      append({
        type: key,
        uniqueKey: crypto.randomUUID(),
        value: '',
      }),
    [append]
  );

  return {
    removeAdditionalProperty: remove,
    addAdditionalProperty,
    resetAdditionalProperties,
    availableOptions,
    allAdditionalProperties,
    additionalPropertiesToDisplay,
  };
};

export const shouldDisableAdditionalProperty = (
  additionalProperty: StubAny,
  thenState: StubAny
) => {
  switch (additionalProperty.key) {
    case 'Assignee':
      return thenState.value?.key === 'OpenIssueInSameRepository';
    default:
      return false;
  }
};
