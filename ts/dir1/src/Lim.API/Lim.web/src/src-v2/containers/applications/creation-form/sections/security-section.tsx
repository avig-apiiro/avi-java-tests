import { RadioGroupControl, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Heading3, Heading5 } from '@src-v2/components/typography';
import { ApiGatewaysFields } from '@src-v2/containers/profiles/api-gateways-fields';
import { useInject, useSuspense } from '@src-v2/hooks';

export function SecuritySection() {
  const { applicationProfilesV2 } = useInject();
  const { complianceRequirementsOptions } = useSuspense(
    applicationProfilesV2.getConfigurationOptions
  );

  return (
    <FormLayoutV2.Section>
      <Heading3>Security</Heading3>
      <FormLayoutV2.Label>
        <Heading5>Internet facing</Heading5>
        <RadioGroupControl
          horizontal
          name="isInternetFacing"
          defaultValue="No"
          options={['No', 'Yes']}
        />
      </FormLayoutV2.Label>

      <FormLayoutV2.Label>
        <Heading5>Compliance Requirements</Heading5>
        <SelectControlV2
          multiple
          placeholder="Select application compliance requirements..."
          name="complianceRequirements"
          options={complianceRequirementsOptions}
        />
      </FormLayoutV2.Label>

      <FormLayoutV2.Label as="div">
        <Heading5>API gateways</Heading5>
        <ApiGatewaysFields name="apiGateways" />
      </FormLayoutV2.Label>
    </FormLayoutV2.Section>
  );
}
