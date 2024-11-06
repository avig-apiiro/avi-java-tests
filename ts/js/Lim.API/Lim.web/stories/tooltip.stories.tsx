import { Meta } from '@storybook/react';
import { CircleButton, LinkMode, TextButton } from '../src/src-v2/components/button-v2';
import { VendorIcon } from '../src/src-v2/components/icons';
import { Tooltip as TooltipCmp } from '../src/src-v2/components/tooltips/tooltip';
import { Size } from '../src/src-v2/components/types/enums/size';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';

export default {
  title: 'Components/Tooltip',
  components: TooltipCmp,
  argTypes: {},
} as Meta;

const TooltipTemplate = args => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <TextButton href="https://atomiks.github.io/tippyjs/" mode={LinkMode.EXTERNAL}>
      Tippy.js is the complete tooltip, popover, dropdown, and menu solution for the web, powered by
      Popper.
    </TextButton>
    <TooltipCmp {...args}>
      <CircleButton onClick={() => alert('On click')} size={Size.LARGE} variant={Variant.FLOATING}>
        <VendorIcon name="Slack" />
      </CircleButton>
    </TooltipCmp>
  </div>
);
export const Tooltip = TooltipTemplate.bind({});
Tooltip.args = {
  content: 'This is the tooltip',
};
