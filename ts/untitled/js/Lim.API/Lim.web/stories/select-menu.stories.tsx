import { Meta } from '@storybook/react';
import { SelectMenu as SelectMenuComponent } from '@src-v2/components/select-menu';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';
import { Dropdown } from '../src/src-v2/components/dropdown';

export default {
  title: 'Components/SelectMenu',
  argTypes: {
    size: {
      control: {
        type: 'select',
      },
      options: [Size.SMALL, Size.MEDIUM, Size.LARGE],
    },
    variant: {
      options: [
        Variant.PRIMARY,
        Variant.SECONDARY,
        Variant.TERTIARY,
        Variant.ATTENTION,
        Variant.FILTER,
      ],
      control: { type: 'select' },
    },
  },
} as Meta;

const SelectMenuTemplate = args => (
  <SelectMenuComponent {...args}>
    <Dropdown.Group title="Group 1">
      <Dropdown.Item>Item 1</Dropdown.Item>
    </Dropdown.Group>
    <Dropdown.Group title="Group 2">
      <Dropdown.Item>Item 2</Dropdown.Item>
    </Dropdown.Group>
  </SelectMenuComponent>
);

export const SelectMenu = SelectMenuTemplate.bind({});
SelectMenu.args = {
  disabled: false,
  placeholder: 'Select...',
  leftIconName: '',
  icon: 'Chevron',
  active: true,
  readOnly: false,
};
