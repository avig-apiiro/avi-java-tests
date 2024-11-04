import { useFieldArray, useFormContext } from 'react-hook-form';
import { FieldItem } from '@src-v2/containers/manual-findings/form/components/additional-fields-menu';
import { useFieldToComponent } from '@src-v2/containers/manual-findings/form/components/use-field-to-component';

export const SelectedFieldsContent = () => {
  const { watch } = useFormContext();
  const fields = watch('additionalFields');
  const { remove } = useFieldArray({ name: 'additionalFields' });

  const getComponent = useFieldToComponent();
  return (
    <>
      {fields?.map((field: FieldItem, index: number) => {
        const Component = getComponent({ label: field?.key, value: field?.key });
        return <Component name="newFinding" index={index} remove={remove} />;
      })}
    </>
  );
};
