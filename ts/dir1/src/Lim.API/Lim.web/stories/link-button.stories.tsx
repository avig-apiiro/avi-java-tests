import { Meta } from '@storybook/react';
import { Size } from '@src-v2/components/types/enums/size';
import { Button as ButtonCmp } from '../src/src-v2/components/button-v2';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';

export default {
  title: 'Components/Buttons',
  component: ButtonCmp,
  argTypes: {
    size: {
      control: {
        type: 'select',
      },
      options: [Size.SMALL, Size.MEDIUM, Size.LARGE],
    },
    variant: {
      control: {
        type: 'select',
      },
      options: [Variant.PRIMARY, Variant.SECONDARY, Variant.TERTIARY, Variant.ATTENTION],
    },
  },
} as Meta;

const LinkButtonTemplate = args => (
  <div>
    <h5 style={{ marginBottom: '2rem' }}>
      Use "to" prop in order to navigate within the application. Use "href" prop in order to
      navigating to external url
    </h5>{' '}
    <ButtonCmp {...args} />
  </div>
);
export const ButtonLink = LinkButtonTemplate.bind({});
ButtonLink.args = {
  href: 'https://mui.com/material-ui/react-typography/',
  children: 'Click me',
  size: Size.LARGE,
  variant: Variant.SECONDARY,
  startIcon: 'Plus',
  endIcon: 'Arrow',
};
