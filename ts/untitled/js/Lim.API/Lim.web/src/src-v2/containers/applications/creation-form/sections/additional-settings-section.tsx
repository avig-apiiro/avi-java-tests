import { useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { InputV2 } from '@src-v2/components/forms';
import { InputControl, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SelectV2 } from '@src-v2/components/select/select-v2';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Heading3, Heading5 } from '@src-v2/components/typography';
import { EntryPointsFields } from '@src-v2/containers/applications/advanced-definitions-fields/entry-points-fields';
import { PointOfContactFields } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { useInject, useSuspense, useValidation } from '@src-v2/hooks';

export function AdditionalSettingsSection() {
  const { applicationProfilesV2 } = useInject();
  const { validateEmptySpace } = useValidation();
  const applicationType: { label: string; value: string } | null = useWatch({
    name: 'applicationType',
  });
  const { applicationTypesOptions, deploymentLocationOptions } = useSuspense(
    applicationProfilesV2.getConfigurationOptions
  );

  return (
    <FormLayoutV2.Section>
      <Heading3>Additional settings</Heading3>
      <FormLayoutV2.Label>
        <Heading5>Application type</Heading5>
        <ApplicationTypeFieldContainer>
          <SelectControlV2
            name="applicationType"
            placeholder="Select an application type..."
            options={applicationTypesOptions}
          />

          {applicationType?.value === 'Other' && (
            <InputControl
              name="applicationTypeOther"
              placeholder="Enter custom type..."
              rules={{
                required: true,
                validate: validateEmptySpace,
              }}
            />
          )}
        </ApplicationTypeFieldContainer>
      </FormLayoutV2.Label>
      <FormLayoutV2.Label>
        <Heading5>Deployment location</Heading5>
        <SelectControlV2
          searchable={false}
          name="deploymentLocation"
          placeholder="Select a deployment location..."
          options={deploymentLocationOptions}
        />
      </FormLayoutV2.Label>
      <FormLayoutV2.Label>
        <Heading5>
          Entry points
          <InfoTooltip content="A FQDN describing how to reach this application, e.g. admin.app.com, staging.acme.com" />
        </Heading5>
        <EntryPointsFields name="entryPoints" />
      </FormLayoutV2.Label>
      <FormLayoutV2.Label as="div">
        <Heading5>
          Points of contact
          <InfoTooltip content="Designate the review stakeholders for this application" />
        </Heading5>
        <PointOfContactFields name="pointsOfContact" />
      </FormLayoutV2.Label>
    </FormLayoutV2.Section>
  );
}

const ApplicationTypeFieldContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1rem;

  > ${SelectV2.Container}, > ${InputV2} {
    width: calc(50% - 0.5rem);
  }
`;
