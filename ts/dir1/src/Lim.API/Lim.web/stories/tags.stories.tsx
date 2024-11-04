import { Meta } from '@storybook/react';
import styled from 'styled-components';
import { BusinessImpactIndicator } from '../src/src-v2/components/business-impact-indictor';
import {
  InsightTag as InsightTagComponent,
  RiskTag as RiskTagComponent,
  SeverityTag as SeverityTagComponent,
} from '../src/src-v2/components/tags';
import { Size } from '../src/src-v2/components/types/enums/size';

export default {
  title: 'Components/Tags',
  argTypes: {},
} as Meta;

const SeverityTagTemplate = args => (
  <Container>
    <SeverityTagComponent {...args} size={Size.LARGE} riskLevel="critical">
      Critical
    </SeverityTagComponent>
    <SeverityTagComponent {...args} size={Size.MEDIUM} riskLevel="high">
      High
    </SeverityTagComponent>
    <SeverityTagComponent {...args} size={Size.SMALL} riskLevel="medium">
      Medium
    </SeverityTagComponent>
    <SeverityTagComponent {...args} size={Size.XSMALL} riskLevel="low">
      Low
    </SeverityTagComponent>
    <SeverityTagComponent {...args} size={Size.XXSMALL} riskLevel="positive">
      Positive
    </SeverityTagComponent>
  </Container>
);
export const SeverityTag = SeverityTagTemplate.bind({});
SeverityTag.args = {};

const RiskTagTemplate = args => (
  <Container>
    <RiskTagComponent {...args} size={Size.LARGE} riskLevel="critical">
      Critical
    </RiskTagComponent>
    <RiskTagComponent {...args} size={Size.MEDIUM} riskLevel="high">
      High
    </RiskTagComponent>
    <RiskTagComponent {...args} size={Size.SMALL} riskLevel="medium">
      Medium
    </RiskTagComponent>
    <RiskTagComponent {...args} size={Size.XSMALL} riskLevel="low">
      Low
    </RiskTagComponent>
    <RiskTagComponent {...args} size={Size.XXSMALL} riskLevel="accepted">
      Accepted
    </RiskTagComponent>
    <RiskTagComponent {...args} size={Size.XXSMALL}>
      Ignored
    </RiskTagComponent>
  </Container>
);
export const RiskTag = RiskTagTemplate.bind({});
RiskTag.args = {};

const BusinessImpactIndicatorTemplate = args => (
  <Container>
    <BusinessImpactIndicator {...args} size={Size.LARGE} businessImpact="High" />
    <BusinessImpactIndicator {...args} size={Size.MEDIUM} businessImpact="Medium" />
    <BusinessImpactIndicator {...args} size={Size.SMALL} businessImpact="Low" />
    <BusinessImpactIndicator {...args} size={Size.XSMALL} businessImpact="High" />
    <BusinessImpactIndicator {...args} size={Size.XXSMALL} businessImpact="Medium" />
  </Container>
);

export const BusinessImpactIndicatorTag = BusinessImpactIndicatorTemplate.bind({});
BusinessImpactIndicatorTag.args = {
  children: '',
};

const InsightTagTemplate = args => (
  <Container>
    <InsightTagComponent
      {...args}
      size={Size.LARGE}
      insight={{ badge: 'Insight', description: 'description', sentiment: 'Positive' }}
    />
    <InsightTagComponent
      {...args}
      size={Size.MEDIUM}
      insight={{ badge: 'Insight', description: 'description', sentiment: 'Negative' }}
    />
    <InsightTagComponent
      {...args}
      size={Size.SMALL}
      insight={{ badge: 'Insight', description: 'description' }}
    />
  </Container>
);

export const InsightTag = InsightTagTemplate.bind({});
InsightTag.args = {
  children: '',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
