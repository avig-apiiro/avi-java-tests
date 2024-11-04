import { InputControl } from '@src-v2/components/forms/form-controls';
import { FormFieldArray } from '@src-v2/components/forms/form-field-array';
import { useConditionalValidation, useValidation } from '@src-v2/hooks';

export const EntryPointsFields = ({ name, ...props }: { name: string }) => (
  <FormFieldArray {...props} name={name} buttonText="Add entrypoint">
    {EntryPointField}
  </FormFieldArray>
);

const EntryPointField = ({ name }) => {
  const { validateEmptySpace, validateURL } = useValidation();

  return (
    <>
      <InputControl
        name={`${name}.url`}
        placeholder="For example: www.myapplication.com"
        rules={{
          validate: useConditionalValidation(
            url => validateURL(url) || validateEmptySpace(url),
            name
          ),
        }}
      />
      <InputControl
        name={`${name}.name`}
        placeholder="For example: main, backoffice, admin,..."
        rules={{ validate: useConditionalValidation(validateEmptySpace, name) }}
      />
    </>
  );
};
