import styled from 'styled-components';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading3, SubHeading3 } from '@src-v2/components/typography';
import { SlaPolicyControl } from '@src-v2/containers/pages/general-settings/sla/sla-policy-control';

export const SLAPolicy = () => (
  <FormLayoutV2.Section>
    <Header>
      <Heading3>Global SLA policy</Heading3>
      <SubHeading3 data-variant={Variant.SECONDARY}>
        Set a timeframe (in days) for each severity.
      </SubHeading3>
    </Header>
    <MainPolicyControl />
    <FormLayoutV2.SectionFooter>
      <SvgIcon name="Info" size={Size.XXSMALL} />
      The SLA timeframe must be a value between 1-365 days
    </FormLayoutV2.SectionFooter>
  </FormLayoutV2.Section>
);

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MainPolicyControl = styled(SlaPolicyControl)`
  width: 114rem;
`;
