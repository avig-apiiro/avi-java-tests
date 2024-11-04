import { Meta } from '@storybook/react';
import { ActivityIndicator as ActivityIndicatorCmp } from '../src/src-v2/components/activity-indicator';

export default {
  title: 'Components/ActivityIndicator',
  component: ActivityIndicatorCmp,
  argTypes: {
    active: { type: { name: 'boolean' } },
  },
} as Meta;

const ActivityIndicatorTemplate = args => <ActivityIndicatorCmp {...args} />;
export const ActivityIndicator = ActivityIndicatorTemplate.bind({});
ActivityIndicator.args = {
  active: true,
  content: 'This can be a string, jsx, or a component',
};
