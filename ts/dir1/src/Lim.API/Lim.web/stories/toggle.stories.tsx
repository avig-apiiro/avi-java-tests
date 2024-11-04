import { Meta } from '@storybook/react';
import { CheckboxToggle as CheckboxToggleCmp } from '../src/src-v2/components/forms';

export default {
  title: 'Components/Toggle',
  argTypes: {
    checked: {
      control: {
        type: 'select',
        labels: [true, false],
      },
    },
    onChange: {},
  },
} as Meta;

const CheckboxToggleTemplate = args => <CheckboxToggleCmp {...args} />;
export const CheckboxToggle = CheckboxToggleTemplate.bind({});
CheckboxToggle.args = {
  checked: true,
  onChange: event => alert(event.target.value),
};
