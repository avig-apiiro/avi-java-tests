import _ from 'lodash';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { ErrorTypeMapping } from '@src-v2/components/forms/field-error-display';
import { toArray } from '@src-v2/utils/collection-utils';
import { isEmptyDeep } from '@src-v2/utils/object-utils';

export const useValidation = () => {
  const validateEmptyItem = (value: any): true | string => {
    return value ? true : ErrorTypeMapping.required;
  };

  const validateEmptySpace = (value: string): true | string => {
    const emptySpaceRegex: RegExp = /\S/;
    return emptySpaceRegex.test(value) || ErrorTypeMapping.required;
  };
  const validateEmail = (value: string): true | string => {
    const emailRegex: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(value) || 'Please make sure to enter a valid email address';
  };

  const validateURL = (value: string): true | string => {
    const urlRegex: RegExp = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[\w.-]+\.\w+(?::\d+)?(?:\/.*)?$/;

    return urlRegex.test(value) || 'Please enter valid URL';
  };

  return {
    validateEmail,
    validateEmptyItem,
    validateEmptySpace,
    validateURL,
  };
};

export function useConditionalValidation(
  validator: (value: any, formValues: any) => boolean | string,
  dependantFields: string | string[]
) {
  const { getValues } = useFormContext();

  return useCallback(
    (value: any, formValues: any) => {
      const shouldValidate =
        !isEmptyDeep(value) ||
        toArray(dependantFields).some(fieldName => !isEmptyDeep(getValues(fieldName)));

      return !shouldValidate || validator(value, formValues);
    },
    [validator, dependantFields]
  );
}
