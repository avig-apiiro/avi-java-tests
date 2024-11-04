import { Meta } from '@storybook/react';
import { Counter as CounterCmp } from '@src-v2/components/counter';

export default {
  title: 'Components/Counter',
  component: CounterCmp,
  argTypes: {},
} as Meta;

const CounterTemplate = args => <CounterCmp {...args} />;
export const Counter = CounterTemplate.bind({});
Counter.args = {
  children: '+3',
};
