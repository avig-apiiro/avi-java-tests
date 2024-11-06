import { Meta } from '@storybook/react';
import { LabelToggle as LabelToggleComponent } from '../src/src-v2/components/forms';

export default {
  title: 'Components/Label Toggle',
  component: LabelToggleComponent,
  args: {
    labels: ['First option', 'Last option'],
  },
} as Meta;

const Template = args => (
  <div style={{ margin: '4rem' }}>
    <LabelToggleComponent {...args} />
  </div>
);
export const LabelToggle = Template.bind({});
LabelToggle.args = { onChange: (label: string) => alert(`onChange: ${label}`) };
