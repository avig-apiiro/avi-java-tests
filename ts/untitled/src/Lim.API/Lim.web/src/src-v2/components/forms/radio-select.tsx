import { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import styled from 'styled-components';
import { CustomInput } from '@src-v2/components/forms/custom-input';

export function RadioSelect({ name, rules, control, defaultValue, options, ...props }) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      defaultValue={rules?.required ? defaultValue ?? options?.[0]?.value : defaultValue}
      render={({ field }) => (
        <Container {...props}>
          {options.map(option => (
            // @ts-expect-error
            <RadioSelect.Button
              {...field}
              key={option.value}
              checked={field.value === option.value}
              value={option.value}
              onClick={event => {
                if (field.value === option.value) {
                  event.target.checked = false;
                  field.onChange(null);
                }
              }}>
              {option.label ?? option.value ?? option}
            </RadioSelect.Button>
          ))}
        </Container>
      )}
    />
  );
}

RadioSelect.Button = styled(
  forwardRef((props, ref) => <CustomInput ref={ref} {...props} type="radio" />)
)`
  display: inline-flex;
  height: 8rem;
  padding: 0 3rem;
  font-size: var(--font-size-s);
  font-weight: 500;
  line-height: 8rem;
  align-items: center;
  background-color: var(--color-blue-gray-25);
  border: 0.5rem solid var(--color-blue-gray-30);
  border-radius: 100vmax;
  user-select: none;
  cursor: pointer;

  &:hover {
    background: var(--color-blue-gray-15);
  }

  ${(CustomInput as any).HiddenInput}:checked + & {
    color: var(--color-blue-gray-60);
    background: var(--color-white);
    border-color: var(--color-blue-gray-60);
  }
`;

const Container = styled.div`
  display: flex;
  gap: 2rem;
`;
