import _ from 'lodash';
import { StubAny } from '@src-v2/types/stub-any';

type WorkflowItem = {
  type: string;
  subType: string;
  value: string[];
  additionalProperties?: StubAny[];
};

export const transformWorkflowBeforeDisplay = (workflow: StubAny) => {
  const workflowToDisplay = _.cloneDeep(workflow);

  ['given', 'when', 'then'].forEach(step => {
    const stepData: Record<string, WorkflowItem> = {};

    workflowToDisplay[step].forEach((item: StubAny) => {
      if (stepData[item.type]) {
        stepData[item.type].value.push(item.value);
      } else {
        stepData[item.type] = {
          type: item.type,
          subType: item.subType,
          value: [item.value],
          additionalProperties:
            mergeAdditionalPropertiesOfSameType(item.additionalProperties) ?? [],
        };
      }
    });
    workflowToDisplay[step] = Object.values(stepData);
  });

  return workflowToDisplay;
};

export const transformRecipeToWorkflow = (workflow: StubAny) => {
  const workflowToDisplay = _.cloneDeep(workflow);

  ['given', 'when', 'then'].forEach(step => {
    const stepData: Record<string, WorkflowItem> = {};

    workflowToDisplay[step].forEach((item: StubAny) => {
      if (stepData[item.type]) {
        stepData[item.type].value.push(item.value);
      } else {
        stepData[item.type] = {
          type: item.type,
          subType: item.subType,
          value: item.values,
        };
      }
    });
    workflowToDisplay[step] = Object.values(stepData);
  });

  return workflowToDisplay;
};

export const transformWorkflowBeforeSave = (workflow: StubAny) => {
  const workflowToSave = _.cloneDeep(workflow);

  ['given', 'when', 'then'].forEach(step => {
    workflowToSave[step] = workflowToSave[step].flatMap((item: StubAny) => {
      const valuesToSave = [].concat(item.value);

      const processAdditionalProperty = (additionalProperty: StubAny) => {
        const baseProperty = {
          ...additionalProperty,
          value:
            additionalProperty.value?.key ??
            additionalProperty['value-key']?.key ??
            additionalProperty.value ??
            '',
        };

        if (Array.isArray(baseProperty.value)) {
          return baseProperty.value.map((val: StubAny) => ({
            ...baseProperty,
            value: val.key ?? val.value ?? val,
          }));
        }

        return baseProperty;
      };

      const additionalProperties = item.additionalProperties?.flatMap(processAdditionalProperty);

      return valuesToSave.map(value => ({
        type: item.type ?? '',
        subType: item.subType?.key ?? item.subType ?? undefined,
        value: value?.key ?? item['value-key']?.key ?? value?.id ?? value?.label ?? value ?? '',
        ...(additionalProperties?.length > 0 && { additionalProperties }),
      }));
    });
  });

  return workflowToSave;
};

export const transformWorkflowBeforeDuplication = (workflowData: StubAny) => ({
  ...workflowData,
  name: `Copy of ${workflowData.name}`,
  key: crypto.randomUUID(),
  createdAt: new Date(),
});

const mergeAdditionalPropertiesOfSameType = (additionalProperties: StubAny) => {
  if (!additionalProperties || additionalProperties.length === 0) {
    return [];
  }

  const mergedProperties: Record<string, WorkflowItem> = {};

  additionalProperties.forEach((prop: StubAny) => {
    if (!mergedProperties[prop.type]) {
      mergedProperties[prop.type] = { ...prop, value: [] };
    }

    const valueToAdd = prop.value?.key ?? prop['value-key']?.key ?? prop.value ?? '';

    if (Array.isArray(valueToAdd)) {
      mergedProperties[prop.type].value.push(...valueToAdd);
    } else {
      mergedProperties[prop.type].value.push(valueToAdd);
    }
  });

  return Object.values(mergedProperties);
};
