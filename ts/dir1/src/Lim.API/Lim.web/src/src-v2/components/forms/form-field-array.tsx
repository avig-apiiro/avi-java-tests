import { FC, useCallback, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FieldValues, UseFieldArrayProps } from 'react-hook-form/dist/types';
import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import { IconButton } from '@src-v2/components/buttons';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';

interface FormFieldArrayProps {
  buttonText: string;
  name: string;
  children: FC<{ name: string; field: FieldValues; fields: FieldValues[] }>;
  defaultFieldValue?: any;
  keepValuesOnRemove?: boolean;
  options?: Omit<UseFieldArrayProps, 'name'>;
  fieldContainer?: FC<StyledProps>;
  disableAddButton?: boolean;
}

const _FormFieldArray = styled(
  ({
    buttonText,
    name,
    children: Field,
    fieldContainer: Container = FormFieldArray.FieldContainer,
    defaultFieldValue,
    keepValuesOnRemove,
    options = {},
    disableAddButton,
    ...props
  }: FormFieldArrayProps) => {
    const { resetField } = useFormContext();
    const { fields, append, remove } = useFieldArray({ ...options, name });

    const handleAppend = useCallback(
      (shouldFocus: boolean = true) => append(defaultFieldValue, { shouldFocus }),
      [append, defaultFieldValue]
    );

    useEffect(() => {
      if (!fields.length) {
        handleAppend(false);
      }
    }, [fields.length]);

    const handleRemove = useCallback(
      (index: number) => {
        if (fields.length === 1) {
          resetField(name, { defaultValue: [] });
        } else {
          if (!keepValuesOnRemove) {
            resetField(`${name}.${index}`, { defaultValue: {} });
          }

          remove(index);
        }
      },
      [fields, resetField, remove]
    );

    return (
      <div {...props}>
        {fields.map((field, index) => (
          <Container key={index}>
            <Field name={`${name}.${index}`} field={field} fields={fields} />
            <IconButton name="Trash" onClick={() => handleRemove(index)} />
          </Container>
        ))}
        {!disableAddButton && (
          <AppendButtonContainer>
            <CircleButton
              variant={Variant.PRIMARY}
              size={Size.XSMALL}
              onClick={() => handleAppend()}>
              <SvgIcon name="Plus" />
            </CircleButton>
            {buttonText}
          </AppendButtonContainer>
        )}
      </div>
    );
  }
)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AppendButtonContainer = styled.label`
  display: flex;
  cursor: pointer;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
`;

const FieldContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1rem;

  ${BaseIcon}[data-name='Trash']:last-child {
    margin: 1.5rem;
  }
`;

export const FormFieldArray = assignStyledNodes(_FormFieldArray, { FieldContainer });
