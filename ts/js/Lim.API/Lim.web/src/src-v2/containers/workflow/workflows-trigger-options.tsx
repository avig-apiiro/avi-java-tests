import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { RadioGroupControl, SelectControl } from '@src-v2/components/forms/form-controls';
import { Title } from '@src-v2/components/typography';
import { useWorkflowEditor } from '@src-v2/containers/workflow/hooks/use-workflow-editor';

export const WorkflowTriggerOptions = styled(props => {
  const { watch, setValue } = useFormContext();
  const { workflowType } = useWorkflowEditor({});

  const givenValue = watch('given[0]');

  const isSpecificAppOrRepo = Boolean(
    givenValue?.value?.length > 0 &&
      givenValue?.value?.[0]?.key !== 'any' &&
      givenValue?.subType !== 'Any'
  );

  useEffect(() => {
    if (!isSpecificAppOrRepo) {
      setValue('workflowNotificationEffect', 'Immediate');
    }
  }, [isSpecificAppOrRepo]);

  return (
    <div {...props}>
      <Title>Trigger time</Title>
      <RadioGroupControl
        defaultValue="Immediate"
        name="workflowNotificationEffect"
        options={[
          { value: 'Immediate', label: 'Immediate' },
          {
            value: 'Periodic',
            label: 'Periodic',
            disabled: workflowType !== 'MaterialChange' || !isSpecificAppOrRepo,
          },
        ]}
      />
      {watch('workflowNotificationEffect') === 'Periodic' && (
        <SelectControl
          name="workflowPeriod"
          defaultValue="Weekly"
          items={['Weekly', 'Monthly', 'Quarterly']}
          clearable={false}
          placeholder="Select period..."
        />
      )}
    </div>
  );
})`
  flex-basis: 100rem;
  color: var(--color-blue-gray-60);
  flex-direction: column;
  display: flex;
  gap: 2rem;

  ${Title} {
    font-size: var(--font-size-s);
    color: var(--color-blue-gray-70);
    font-weight: 600;
    margin-bottom: 0;
  }
`;
