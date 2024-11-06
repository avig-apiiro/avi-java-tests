import { Meta } from '@storybook/react';
import { ContentLimiter as ContentLimiterCmp } from '../src/src-v2/components/content-limiter';

export default {
  title: 'Components/Content Limiter',
  component: ContentLimiterCmp,
  argTypes: {},
} as Meta;

const ContentLimiterTemplate = args => <ContentLimiterCmp {...args} />;
export const ContentLimiter = ContentLimiterTemplate.bind({});
ContentLimiter.args = {
  limit: 4,
  children: [1, 2, 3, 4, 5, 6].map(number => <div>{number}</div>),
};
