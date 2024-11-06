import { Meta } from '@storybook/react';
import { Size } from '@src-v2/components/types/enums/size';
import {
  LinkMode,
  TextButton as TextButtonCmp,
} from '../src/src-v2/components/button-v2/text-button';

export default {
  title: 'Components/Buttons',
  component: TextButtonCmp,
  argTypes: {},
} as Meta;

const LinkButtonTemplate = args => (
  <div>
    <h5 style={{ marginBottom: '2rem' }}>
      Use "to" prop in order to navigate within the application. Use "href" prop in order to
      navigating to external url
    </h5>{' '}
    <TextButtonCmp {...args} />
  </div>
);

export const TextButton = LinkButtonTemplate.bind({});
TextButton.args = {
  children: 'Click me',
  size: Size.XSMALL,
  showArrow: false,
  onClick: () => alert('onClick'),
};
export const TextButtonLink = LinkButtonTemplate.bind({});
TextButtonLink.args = {
  href: 'https://mui.com/material-ui/react-typography/',
  children: 'Click me',
  size: Size.XSMALL,
  mode: LinkMode.EXTERNAL,
  showArrow: true,
};
