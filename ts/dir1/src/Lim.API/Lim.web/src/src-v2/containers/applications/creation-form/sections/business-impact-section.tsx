import styled from 'styled-components';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { InputControl, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SvgIcon } from '@src-v2/components/icons';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading3, Heading5 } from '@src-v2/components/typography';
import { useInject, useSuspense } from '@src-v2/hooks';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';

const businessImpactOptions = [BusinessImpact.high, BusinessImpact.medium, BusinessImpact.low].map(
  businessImpact => ({
    value: businessImpact,
    label: businessImpact,
  })
);

export function BusinessImpactSection() {
  const { applicationProfilesV2 } = useInject();
  const { estimatedUsersNumberOptions, estimatedRevenueOptions } = useSuspense(
    applicationProfilesV2.getConfigurationOptions
  );

  return (
    <SectionContainer>
      <Heading3>Business impact</Heading3>

      <FormLayoutV2.Label>
        <Heading5>
          Business impact
          <InfoTooltip content="Override business impact calculated by Apiiro" />
        </Heading5>

        <SelectControlV2
          searchable={false}
          name="businessImpact"
          placeholder="Select Business impact..."
          options={businessImpactOptions}
          option={({ data }) => (
            <>
              <BusinessImpactIndicator businessImpact={data.value} /> {data.label}
            </>
          )}
        />
      </FormLayoutV2.Label>

      <FormLayoutV2.Label>
        <Heading5>Business unit</Heading5>
        <InputControl name="businessUnit" placeholder="Type business unit Name" />
      </FormLayoutV2.Label>

      <FormLayoutV2.Label>
        <Heading5>
          Estimated number of users
          <InfoTooltip content="Estimated number of users is used to calculate business impact" />
        </Heading5>

        <SelectControlV2
          searchable={false}
          name="estimatedUsersNumber"
          options={estimatedUsersNumberOptions}
        />
      </FormLayoutV2.Label>

      <FormLayoutV2.Label>
        <Heading5>
          Estimated revenue
          <InfoTooltip content="Estimated revenue is used to calculate business impact" />
        </Heading5>

        <SelectControlV2
          searchable={false}
          name="estimatedRevenue"
          placeholder="Select range..."
          options={estimatedRevenueOptions}
        />
      </FormLayoutV2.Label>
      <FormLayoutV2.SectionFooter>
        <SvgIcon name="Info" size={Size.XXSMALL} />
        Business impact helps you prioritize risk remediation. The setting is calculated
        automatically and can be overridden by selecting a different value
      </FormLayoutV2.SectionFooter>
    </SectionContainer>
  );
}

const SectionContainer = styled(FormLayoutV2.Section)`
  ${FormLayoutV2.Label} {
    width: 110rem;
  }
`;
