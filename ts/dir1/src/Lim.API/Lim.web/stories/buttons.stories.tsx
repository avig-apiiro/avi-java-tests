import { Meta } from '@storybook/react';
import { Size } from '@src-v2/components/types/enums/size';
import { Button as ButtonCmp } from '../src/src-v2/components/button-v2';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';

export default {
  title: 'Components/Buttons',
  component: ButtonCmp,
  argTypes: {
    size: {
      options: [Size.SMALL, Size.MEDIUM, Size.LARGE],
      control: { type: 'select' },
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
    onClick: () => alert('onClick'),
  },
} as Meta;

const ButtonTemplate = args => <ButtonCmp {...args} />;

export const Button = ButtonTemplate.bind({});
Button.args = {
  children: 'Click me',
  size: Size.LARGE,
  startIcon: 'Plus',
  endIcon: 'Arrow',
  loading: false,
  disabled: false,
  onClick: () => alert('onClick'),
};
