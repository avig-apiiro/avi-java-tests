import { useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { CheckboxToggle } from '@src-v2/components/forms';
import { CheckboxControl, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import {
  ExternalLink,
  Heading3,
  Heading5,
  SubHeading3,
  SubHeading4,
} from '@src-v2/components/typography';
import { useRiskyTickets } from '@src-v2/containers/pages/general-settings/use-risky-tickets';
import { FormLayoutV2, InputClickableLabel } from '@src/src-v2/components/forms/form-layout-v2';

export interface RiskyTicketsOption {
  value: string;
  label: string;
  icon: string;
}

export const MonitorDesignRisks = () => {
  const { monitoredRiskTickets } = useRiskyTickets();
  const isMonitoringEnabled = useWatch({ name: 'isMonitoringEnabled' });

  return (
    <FormLayoutV2.Section>
      <Header>
        <Heading3>Monitor design risks</Heading3>
        <SubHeading3 data-variant={Variant.SECONDARY}>
          Secure your software development life cycle from its inception, before a single line of
          code is written. Identify potential risks and security gaps with Apiiro’s risk analysis
          and assessment for your proposed feature changes.
        </SubHeading3>
      </Header>
      <Label>
        <CheckboxControl Component={CheckboxToggle} name="isMonitoringEnabled" />
        {isMonitoringEnabled ? <>Active</> : <>Inactive</>}
      </Label>
      {isMonitoringEnabled && (
        <FormLayoutV2.Label required>
          <Heading5>Issue types selection</Heading5>
          <SubHeading4>Select the issue types to scan within your monitored projects</SubHeading4>

          <SelectControlV2
            multiple
            rules={{ required: true }}
            options={monitoredRiskTickets}
            name="enabledRiskyTickets"
            placeholder="Type to select..."
            formatOptionLabel={(option: RiskyTicketsOption) => (
              <FormatedOptionLabel>
                <VendorIcon name={option.icon} size={Size.XSMALL} />
                {option.label}
              </FormatedOptionLabel>
            )}
          />
        </FormLayoutV2.Label>
      )}
      <ExternalLink href="https://docs.apiiro.com/fix-design-risk/risky_features">
        Learn more about design risks
      </ExternalLink>
    </FormLayoutV2.Section>
  );
};

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled(InputClickableLabel)`
  display: flex;
  gap: 2rem;
  align-items: center;
  width: fit-content;
`;

const FormatedOptionLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
