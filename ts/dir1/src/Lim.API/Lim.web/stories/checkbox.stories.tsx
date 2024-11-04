import { Meta } from '@storybook/react';
import { Checkbox as CheckboxCmp } from '../src/src-v2/components/forms';

export default {
  title: 'Components/Checkbox',
  argTypes: {
    checked: {
      control: {
        type: 'select',
        labels: [true, false],
      },
    },
    value: {
      control: {
        type: 'string',
      },
    },
    icon: {
      control: {
        type: 'string',
      },
    },
    disabled: {
      control: {
        type: 'select',
        labels: [true, false],
      },
    },
    onChange: {},
  },
} as Meta;

const CheckboxTemplate = args => <CheckboxCmp {...args} />;
export const Checkbox = CheckboxTemplate.bind({});
Checkbox.args = {
  disabled: false,
};
