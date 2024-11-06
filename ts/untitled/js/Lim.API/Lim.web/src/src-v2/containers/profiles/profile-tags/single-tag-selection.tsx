import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ErrorTypeMapping } from '@src-v2/components/forms/field-error-display';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormTagValue } from '@src-v2/containers/profiles/profile-tags/manage-profile-tags-modal';
import { useConditionalValidation, useValidation } from '@src-v2/hooks';
import { TagOption } from '@src-v2/types/profiles/tags/profile-tag';
import { StubAny } from '@src-v2/types/stub-any';

interface SingleTagSelectionProps {
  name: string;
  tagOptions: TagOption[];
  usedTagsData: Record<string, { name: string; values: string[] }>;
}

export function SingleTagSelection({
  name: fieldName,
  tagOptions,
  usedTagsData,
}: SingleTagSelectionProps) {
  const { validateEmptyItem } = useValidation();

  const { keyOption: selectedTagKeyOption }: FormTagValue = useWatch({ name: fieldName }) ?? {};
  const { setValue } = useFormContext();

  const usedTagKeyNames = useMemo(
    () => Object.values(usedTagsData).flatMap(tag => tag.name),
    [usedTagsData]
  );

  const currentTagOptionalValues = useMemo(() => {
    const tagKey = selectedTagKeyOption?.key;
    if (!tagKey) {
      return [];
    }

    const usedTagValues = usedTagsData[tagKey]?.values;
    return _.differenceBy(selectedTagKeyOption?.optionalValues, usedTagValues).map(value => ({
      label: value,
      value,
    }));
  }, [selectedTagKeyOption, usedTagsData]);

  const handleNameChanged = useCallback(
    () => setValue(`${fieldName}.valueOption`, null),
    [fieldName, setValue]
  );

  const validateTagKeyOption = useCallback(
    (keyOption: TagOption) =>
      !keyOption
        ? ErrorTypeMapping.required
        : keyOption.name.includes(' ')
          ? "Tag name can contain only out of alphanumeric characters or '_'"
          : true,
    []
  );

  const validateNewKeyOption = useCallback(
    (inputValue: string) =>
      Boolean(inputValue) && !usedTagKeyNames.some(name => name === inputValue),
    [usedTagKeyNames]
  );

  const validateNewValueOption = useCallback(
    (inputValue: string) =>
      Boolean(inputValue) && !currentTagOptionalValues.some(option => option.value === inputValue),
    [currentTagOptionalValues]
  );

  return (
    <>
      <SelectControlV2
        creatable
        name={`${fieldName}.keyOption`}
        placeholder="Type a key..."
        options={tagOptions}
        getNewOptionData={(
          inputValue: string,
          label: string
        ): {
          key: string;
          name: string;
          optionalValues: StubAny[];
        } => ({
          key: inputValue,
          name: label,
          optionalValues: [],
        })}
        getOptionLabel={(tag: StubAny) => tag.name}
        isValidNewOption={validateNewKeyOption}
        rules={{
          validate: useConditionalValidation(validateTagKeyOption, fieldName),
        }}
        onChange={handleNameChanged}
      />{' '}
      :{' '}
      <SelectControlV2
        creatable
        placeholder="Type a value..."
        name={`${fieldName}.valueOption`}
        disabled={!selectedTagKeyOption}
        isValidNewOption={validateNewValueOption}
        options={currentTagOptionalValues}
        rules={{
          validate: useConditionalValidation(validateEmptyItem, fieldName),
        }}
      />
    </>
  );
}
