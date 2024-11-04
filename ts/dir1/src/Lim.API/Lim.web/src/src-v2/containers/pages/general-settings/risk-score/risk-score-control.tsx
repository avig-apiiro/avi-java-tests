import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { RiskLevel, getRiskyRiskLevels } from '@src-v2/types/enums/risk-level';

type RiskScoreControlProps = {
  nameSuffix?: string;
  riskLevel: RiskLevel;
  onChange?: () => void;
};

const maxAllowedValue = 2147483647 as const; // Dotnet allows 32-bit signed integer, so this is the maximum allowed value

export const RiskScoreControl = styled(({ namePrefix, ...props }) => (
  <div {...props}>
    {getRiskyRiskLevels()
      .reverse()
      .map(level => (
        <RiskScorePerSeverityControl
          key={level}
          riskLevel={level}
          nameSuffix="RiskWeight"
          name={level.toLowerCase()}
        />
      ))}
  </div>
))`
  width: 114rem;
  display: flex;
  gap: 4rem;
`;

export const RiskScorePerSeverityControl = styled(
  ({
    name: _name,
    nameSuffix,
    riskLevel,
    onChange,
    ...props
  }: RiskScoreControlProps & { name: string }) => {
    const validate = useCallback((input: string) => {
      if (!input) {
        return 'Please enter a positive number.';
      }
      const parsedInput = parseInt(input);
      if (parsedInput <= 0) {
        return 'Invalid entry. Please enter a positive number.';
      }
      if (parsedInput > maxAllowedValue) {
        return `The maximum allowed value is ${maxAllowedValue.toLocaleString()}. Please enter a smaller number.`;
      }
      return true;
    }, []);

    const { setValue, watch } = useFormContext();
    const name = `riskScore.${_name}${nameSuffix}`;
    const setValueToDefault = useCallback(() => {
      if (!watch(name)) {
        setValue(name, 1, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
      }
    }, [setValue, name]);

    return (
      <div {...props}>
        {riskLevel}
        <InputControl
          type="number"
          maxLength={10}
          name={name}
          placeholder="Enter weight..."
          onClearClicked={() => {
            setTimeout(setValueToDefault, 0); //setTimeout here is in order to handle clear click after clear is over, otherwise it will not set to default value
          }}
          onBlur={setValueToDefault}
          rules={{
            validate,
          }}
        />
      </div>
    );
  }
)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
`;
