import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Dropdown } from '@src-v2/components/dropdown';
import { FormContext } from '@src-v2/components/forms/form-context';
import { Form } from '@src-v2/components/forms/form-layout';
import { ToastParagraph } from '@src-v2/components/toastify';
import { Heading } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export const ApplicationGroupForm = styled(({ editMode, onSubmit, ...props }) => {
  const history = useHistory();
  const { profiles, toaster, application } = useInject();

  const handleSubmit = useCallback(
    async ({ applications, pointsOfContact, tags = [], ...formData }) => {
      const data = {
        ...formData,
        applicationKeys: applications?.map(application => application.key),
        pointsOfContact: pointsOfContact.flatMap(({ developer, jobTitle }) =>
          developer.map(item => ({ ...item, jobTitle: jobTitle.value ?? jobTitle }))
        ),
        tags: application.isFeatureEnabled(FeatureFlag.ApplicationGroupTags)
          ? tags
          : tags.map(tag => (isTypeOf<{ value: string }>(tag, 'value') ? tag.value : tag)),
      };

      try {
        const applicationGroupSubmitService = application.isFeatureEnabled(
          FeatureFlag.ApplicationGroupTags
        )
          ? profiles.createApplicationGroupV2
          : profiles.createApplicationGroup;

        await applicationGroupSubmitService(data);
        onSubmit?.(data);

        toaster.success(
          !editMode ? (
            <>
              <Heading>Creating your group</Heading>
              <ToastParagraph>
                This process may take up to 2 hours, depending on your environment
              </ToastParagraph>
            </>
          ) : (
            'Changes saved successfully!'
          )
        );
        history.push('/profiles/groups');
      } catch (e) {
        toaster.error('Failed to create group');
      }
    },
    [editMode]
  );

  return (
    <AsyncBoundary>
      <FormContext {...props} onSubmit={handleSubmit} shouldUseNativeValidation />
    </AsyncBoundary>
  );
})`
  ${Dropdown.List} {
    max-height: 55rem;
  }

  ${LogoSpinner} {
    width: 4rem;
    height: 4rem;
  }

  ${Form.LabelCell} {
    height: 9rem;
  }
`;
