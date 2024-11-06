import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@src-v2/components/button-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { TABS } from '@src-v2/containers/applications/application-form-advanced-definitions';
import { useApplicationFormContext } from '@src-v2/containers/applications/application-form-context';

export function ApplicationFormSubmitButton() {
  const {
    formState: { errors, isSubmitting },
  } = useFormContext();

  const { setAdvancedDefinitionsTab } = useApplicationFormContext();

  const handleSubmitClick = useCallback(() => {
    if (errors.entryPoints || errors.pointsOfContact) {
      setAdvancedDefinitionsTab(TABS.GENERAL);
    } else if (errors.apiGateways) {
      setAdvancedDefinitionsTab(TABS.SECURITY);
    }
  }, [errors.entryPoints, errors.pointsOfContact, errors.apiGateways]);

  return (
    <Button
      loading={isSubmitting}
      data-test-marker="create-application-submit"
      type="submit"
      onClick={handleSubmitClick}
      size={Size.LARGE}
      variant={Variant.PRIMARY}>
      Save
    </Button>
  );
}
