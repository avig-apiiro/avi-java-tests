import isEmpty from 'lodash/isEmpty';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { StubAny } from '@src-v2/types/stub-any';

export const useConvertDataForDisplay = ({
  name,
  defaultValue,
  multiple,
  items,
}: {
  name: string;
  defaultValue: StubAny;
  multiple: StubAny;
  items: StubAny[];
}) => {
  const { setValue, watch } = useFormContext();
  const initialValue = watch(name);

  // Make sure values of multiple-select controls values are inside an array and single-select are strings.
  if (multiple && !Array.isArray(initialValue)) {
    setValue(name, [initialValue]);
  } else if (!multiple && Array.isArray(initialValue)) {
    setValue(name, initialValue[0]);
  }

  useEffect(() => {
    if (defaultValue && !initialValue) {
      setValue(name, defaultValue);
    }
  }, []);

  // Convert "shallow" backend data to displayable data
  useEffect(() => {
    if (Array.isArray(initialValue)) {
      const updatedValue = initialValue
        .map(value => {
          if (typeof value === 'string') {
            const displayValue = items?.find(item => item.key === value);
            if (!displayValue) {
              return {
                key: value,
                displayName: value,
                invalid: true,
                errorMessage: 'Invalid option',
              };
            }

            return displayValue;
          }
          return null;
        })
        .filter(Boolean);

      if (!isEmpty(updatedValue)) {
        setValue(name, updatedValue);
      }
    }
  }, []);
};
