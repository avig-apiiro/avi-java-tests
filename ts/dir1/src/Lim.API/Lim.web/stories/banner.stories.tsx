import { Meta } from '@storybook/react';
import { Banner as BannerCmp } from '../src/src-v2/components/banner';
import { Button } from '../src/src-v2/components/button-v2';
import { Size } from '../src/src-v2/components/types/enums/size';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';

export default {
  title: 'Components/Banner',
  component: BannerCmp,
  argTypes: {
    title: {
      type: { name: 'string', required: true },
    },
    description: { name: 'string' },
    icon: {
      type: { name: 'string' },
      description: 'Icon can be any support icon string, here are some examples',
      options: ['Plus', 'Check'],
      control: 'select',
    },
    onClose: { name: 'function' },
  },
} as Meta;

const BannerTemplate = args => (
  <BannerCmp {...args}>
    <Button
      onClick={() => alert('Action Button Clicked')}
      variant={Variant.PRIMARY}
      size={Size.SMALL}>
      Action Button
    </Button>
  </BannerCmp>
);
export const BannerToggle = BannerTemplate.bind({});
BannerToggle.args = {
  title: 'Banner Title',
  description: 'Description: Title can be passed as a component',
  onClose: () => alert('onClose'),
  icon: 'Check',
};
