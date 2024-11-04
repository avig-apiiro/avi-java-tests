import { Meta } from '@storybook/react';
import { Popover as PopoverCmp } from '../src/src-v2/components/tooltips/popover';

export default {
  title: 'Components/Popover',
  component: PopoverCmp,
  args: {
    delay: 200,
    content: 'This is the popover content',
  },
  parameters: {
    docs: {
      description: {
        component:
          "*** Please use any of Tippy's props. see documentation: https://atomiks.github.io/tippyjs/\n ***",
      },
    },
  },
} as Meta;

const PopoverTemplate = args => (
  <PopoverCmp {...args}>
    <div style={{ width: 'fit-content' }}>Hover me</div>
  </PopoverCmp>
);
export const Popover = PopoverTemplate.bind({});
Popover.args = {};
