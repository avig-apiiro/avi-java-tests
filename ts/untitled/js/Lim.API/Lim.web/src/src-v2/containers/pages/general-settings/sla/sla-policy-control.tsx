import _ from 'lodash';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { FieldErrorDisplay } from '@src-v2/components/forms/field-error-display';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { getRiskyRiskLevels } from '@src-v2/types/enums/risk-level';

export const emptySlaPolicyError = {
  type: 'emptyPolicyError',
  message: 'At least one SLA value is required',
};

type SlaPolicyControlProps = {
  namePrefix?: string;
  onChange?: () => void;
};

export const SlaPolicyControl = styled(({ namePrefix, onChange, ...props }) => {
  const {
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const policyError = errors?.[namePrefix];
  const handleChange = useCallback(() => {
    if (policyError) {
      clearErrors(namePrefix);
    }

    onChange?.();
  }, [clearErrors, policyError, onChange]);

  return (
    <div {...props}>
      <ControlsContainer>
        {getRiskyRiskLevels()
          .reverse()
          .map(level => (
            <SlaSeverityControl
              key={level}
              namePrefix={namePrefix}
              name={level.toLowerCase()}
              onChange={handleChange}
            />
          ))}
      </ControlsContainer>
      {policyError?.type === emptySlaPolicyError.type && <FieldErrorDisplay error={policyError} />}
    </div>
  );
})``;

const ControlsContainer = styled.div`
  display: flex;
  gap: 4rem;
`;

export const SlaSeverityControl = styled(
  ({ name, namePrefix, onChange, ...props }: SlaPolicyControlProps & { name: string }) => {
    const validate = useCallback((input: string) => {
      if (!input?.length) {
        return true;
      }

      const parsedInput = parseInt(input);
      return (parsedInput > 0 && parsedInput <= 365) || 'Invalid entry';
    }, []);

    return (
      <div {...props}>
        {_.startCase(name)}
        <InputControl
          type="number"
          maxLength={3}
          name={namePrefix ? `${namePrefix}.${name}` : name}
          placeholder="Enter days..."
          rules={{
            validate,
          }}
          onChange={onChange}
        />
      </div>
    );
  }
)`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: 1rem;
`;
