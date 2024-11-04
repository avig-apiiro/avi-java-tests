import { Meta } from '@storybook/react';
import styled from 'styled-components';
import {
  BadgeColors,
  Badge as BadgeComponent,
  CodeBadge as CodeBadgeComponent,
} from '../src/src-v2/components/badges';
import { Size } from '../src/src-v2/components/types/enums/size';

export default {
  title: 'Components/Badges',
  argTypes: {},
} as Meta;

const BadgeTemplate = args => (
  <BadgesContainer>
    <BadgeComponent {...args} color={BadgeColors.Green} size={Size.LARGE} icon="Plus" />
    <BadgeComponent {...args} color={BadgeColors.Blue} size={Size.MEDIUM} onClick={() => null} />
    <BadgeComponent {...args} icon="Plus" />
    <BadgeComponent {...args} color={BadgeColors.Red} size={Size.XSMALL} onClick={() => null} />
    <BadgeComponent {...args} color={BadgeColors.Yellow} size={Size.XXSMALL} />
  </BadgesContainer>
);
export const Badge = BadgeTemplate.bind({});
Badge.args = {
  children: 'Badge',
};

const CodeBadgeTemplate = args => (
  <BadgesContainer>
    <CodeBadgeComponent {...args} size={Size.LARGE} />
    <CodeBadgeComponent {...args} size={Size.MEDIUM} />
    <CodeBadgeComponent {...args} size={Size.SMALL} />
    <CodeBadgeComponent {...args} size={Size.XSMALL} />
    <CodeBadgeComponent {...args} size={Size.XXSMALL} />
  </BadgesContainer>
);
export const CodeBadge = CodeBadgeTemplate.bind({});
CodeBadge.args = {
  children: 'POST',
};

const BadgesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
