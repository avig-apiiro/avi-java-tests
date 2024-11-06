import { Meta } from '@storybook/react';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu as DropdownMenuCmp } from '@src-v2/components/dropdown-menu';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';
import { preventDefault } from '../src/src-v2/utils/dom-utils';

export default {
  title: 'Components/DropdownMenu',
  component: DropdownMenuCmp,
  argTypes: {
    size: {
      control: {
        type: 'select',
      },
      options: [Size.SMALL, Size.MEDIUM, Size.LARGE, Size.XLARGE, Size.XXLARGE, Size.XXXLARGE],
    },
    variant: {
      control: {
        type: 'select',
      },
      options: [Variant.PRIMARY, Variant.SECONDARY, Variant.TERTIARY],
    },
  },
} as Meta;

const DropdownMenuTemplate = args => (
  <DropdownMenuCmp {...args}>
    <Dropdown.Item onClick={() => alert('Clicked Item 1')}>Item 1</Dropdown.Item>
    <Dropdown.Item onClick={() => alert('Clicked Item 2')}>Item 2</Dropdown.Item>
    <Dropdown.Item onClick={() => alert('Clicked Item 3')}>Item 3</Dropdown.Item>
  </DropdownMenuCmp>
);

export const DropdownMenu = DropdownMenuTemplate.bind({});
DropdownMenu.args = {
  onClick: preventDefault,
  variant: Variant.SECONDARY,
  icon: 'Dots',
  onItemClick: () => alert('on item click from prop'),
  onShow: () => alert('on show'),
  onHide: () => alert(' on hide'),
  size: Size.LARGE,
};
