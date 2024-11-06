import styled from 'styled-components';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading3, SubHeading3 } from '@src-v2/components/typography';
import { RiskScoreControl } from '@src-v2/containers/pages/general-settings/risk-score/risk-score-control';

export const RiskScore = () => (
  <FormLayoutV2.Section>
    <Header>
      <Heading3>Risk score policy</Heading3>
      <SubHeading3 data-variant={Variant.SECONDARY}>
        Configure severity weighting factors
      </SubHeading3>
    </Header>
    <RiskScoreControl />
  </FormLayoutV2.Section>
);

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
