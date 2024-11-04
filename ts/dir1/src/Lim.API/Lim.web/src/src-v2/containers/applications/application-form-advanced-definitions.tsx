import _ from 'lodash';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { InputV2 } from '@src-v2/components/forms';
import {
  CheckboxControl,
  InputControl,
  SelectControl,
  SelectControlV2,
} from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { RadioSelect } from '@src-v2/components/forms/radio-select';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Heading, Paragraph } from '@src-v2/components/typography';
import {
  AdvancedContainer,
  AdvancedDefinitionsTabs,
  InternetFacingField,
} from '@src-v2/containers/applications/advanced-definitions-fields/advanced-definitions-tabs';
import { EntryPointsFields } from '@src-v2/containers/applications/advanced-definitions-fields/entry-points-fields';
import { useApplicationFormContext } from '@src-v2/containers/applications/application-form-context';
import { ApiGatewaysFields } from '@src-v2/containers/profiles/api-gateways-fields';
import { PointOfContactFields } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { useInject, useSuspense, useValidation } from '@src-v2/hooks';

export const ApplicationFormAdvancedDefinitions = () => {
  const { applicationProfiles } = useInject();
  const {
    apiGateways,
    applicationTypesOptions,
    estimatedUsersNumberOptions,
    estimatedRevenueOptions,
    complianceRequirementsOptions,
    deploymentLocationOptions,
    businessImpactOptions,
  } = useSuspense(applicationProfiles.getConfigurationOptions);

  const { advancedDefinitionsTab: selectedTab, setAdvancedDefinitionsTab: setSelectedTab } =
    useApplicationFormContext();

  return (
    <>
      <Form.Fieldset data-test-marker="advanced-definitions">
        <Heading>Advanced Definitions</Heading>
        <AdvancedDefinitionsTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          tabs={[
            { value: TABS.GENERAL, label: 'General' },
            { value: TABS.SECURITY, label: 'Security' },
            { value: TABS.BUSINESS_IMPACT, label: 'Business Impact' },
          ]}
        />

        {/*@ts-expect-error*/}
        <AdvancedContainer selected={selectedTab === TABS.GENERAL}>
          <Heading>Application Type</Heading>
          <ApplicationTypeContainer applicationTypesOptions={applicationTypesOptions} />

          <Heading>Deployment Location</Heading>
          <SelectControlV2
            clearable
            name="deploymentLocation"
            placeholder="Select Location..."
            options={deploymentLocationOptions}
          />

          <Heading>
            Entry points (URLs)
            <InfoTooltip content="A FQDN describing how to reach this application, e.g. admin.app.com, staging.acme.com" />
          </Heading>
          <AdvancedDefinitionEntryPoints name="entryPoints" />

          <Heading>
            Points of Contact
            <InfoTooltip content="Define lead personas for this application" />
          </Heading>
          <PointOfContactFields legacyLayout name="pointsOfContact" />
        </AdvancedContainer>

        {/*@ts-expect-error*/}
        <AdvancedContainer selected={selectedTab === TABS.SECURITY}>
          <InternetFacingField>
            Internet Facing
            <CheckboxControl name="isInternetFacing" />
          </InternetFacingField>

          <Heading>API gateways</Heading>
          {_.isEmpty(apiGateways) ? (
            'There are no API gateways connected to this environment. You could connect your first API gateway from the connectors page.'
          ) : (
            <ApiGatewaysFields name="apiGateways" />
          )}

          <Heading>Compliance Requirements</Heading>
          <SelectControlV2
            multiple
            placeholder="Select..."
            name="complianceRequirements"
            options={complianceRequirementsOptions}
          />
        </AdvancedContainer>

        {/*@ts-expect-error*/}
        <AdvancedContainer selected={selectedTab === TABS.BUSINESS_IMPACT}>
          <Description>
            Business impact assists in prioritizing remediation of risks. Business impact is
            calculated automatically and can be overridden below.
          </Description>

          <Heading>
            Business Impact
            <InfoTooltip content="Override business impact calculated by Apiiro" />
          </Heading>
          <RadioSelectRisk name="businessImpact" options={businessImpactOptions} />

          <Heading>Business Unit</Heading>
          <InputControlWrapper name="businessUnit" placeholder="Type Business Unit Name" />

          <Heading>
            Estimated Number of Users
            <InfoTooltip content="Estimated number of users is used to calculate business impact" />
          </Heading>
          <SelectControl
            name="estimatedUsersNumber"
            placeholder="Select..."
            items={estimatedUsersNumberOptions ?? []}
            rules={{ pattern: /\S/ }}
          />

          <Heading>
            Estimated Revenue
            <InfoTooltip content="Estimated revenue is used to calculate business impact" />
          </Heading>
          <SelectControl
            name="estimatedRevenue"
            placeholder="Select..."
            items={estimatedRevenueOptions ?? []}
            rules={{ pattern: /\S/ }}
          />
        </AdvancedContainer>
      </Form.Fieldset>
    </>
  );
};

const RadioSelectRisk = styled(RadioSelect)`
  [value='High']:checked + ${RadioSelect.Button} {
    color: var(--risk-color-high);
    background: var(--color-white);
    border: 0.5rem solid var(--risk-color-high);
  }

  [value='Medium']:checked + ${RadioSelect.Button} {
    color: var(--risk-color-medium);
    background: var(--color-white);
    border: 0.5rem solid var(--risk-color-medium);
  }

  [value='Low']:checked + ${RadioSelect.Button} {
    color: var(--color-yellow-45);
    background: var(--color-white);
    border: 0.5rem solid var(--color-yellow-45);
  }
`;

const ApplicationTypeContainer = styled(({ applicationTypesOptions, ...props }) => {
  const { watch } = useFormContext();
  const { validateEmptySpace } = useValidation();

  return (
    <div {...props}>
      <SelectControlV2
        clearable
        name="applicationType"
        placeholder="Select type..."
        rules={{ pattern: /\S/ }}
        options={applicationTypesOptions}
      />
      {watch('applicationType')?.value === 'Other' && (
        <InputControlWrapper
          name="applicationTypeOther"
          placeholder="Application Type"
          rules={{
            required: true,
            validate: validateEmptySpace,
          }}
        />
      )}
    </div>
  );
})`
  display: flex;
  gap: 3rem;
  align-items: flex-start;
`;

export const TABS = {
  GENERAL: 'general',
  SECURITY: 'security',
  BUSINESS_IMPACT: 'business-impact',
};

const Description = styled(Paragraph)`
  font-size: 3.5rem;
  color: var(--color-blue-gray-60);
`;

const AdvancedDefinitionEntryPoints = styled(EntryPointsFields)`
  ${InputV2} {
    width: 70rem;
  }
`;

const InputControlWrapper = styled(InputControl)`
  width: 70rem;
`;
