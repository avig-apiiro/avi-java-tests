import { Meta } from '@storybook/react';
import { Size } from '@src-v2/components/types/enums/size';
import { CircleButton as CircleButtonCmp } from '../src/src-v2/components/button-v2';
import { SvgIcon, VendorIcon } from '../src/src-v2/components/icons';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';

export default {
  title: 'Components/Buttons',
  component: CircleButtonCmp,
  argTypes: {
    size: {
      control: {
        type: 'select',
      },
      options: [Size.XSMALL, Size.SMALL, Size.MEDIUM, Size.LARGE, Size.XLARGE],
    },
    variant: {
      control: {
        type: 'select',
      },
      options: [
        Variant.PRIMARY,
        Variant.SECONDARY,
        Variant.TERTIARY,
        Variant.ATTENTION,
        Variant.FLOATING,
        Variant.FILTER,
      ],
    },
    onClick: () => alert('onClick'),
  },
} as Meta;

const CircleButtonTemplate = args => <CircleButtonCmp {...args} />;
export const CircleButton = CircleButtonTemplate.bind({});
CircleButton.args = {
  children: <SvgIcon name="Plus" size={Size.LARGE} />,
  size: Size.LARGE,
  variant: Variant.SECONDARY,
  onClick: () => alert('onClick'),
};

export const LinkCircleButton = CircleButtonTemplate.bind({});
LinkCircleButton.args = {
  children: <VendorIcon name="BlackDuck" size={Size.LARGE} />,
  variant: Variant.SECONDARY,
  href: 'https://mui.com/material-ui/react-typography/',
  size: Size.LARGE,
};
