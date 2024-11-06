import { Meta } from '@storybook/react';
import { Size } from '@src-v2/components/types/enums/size';
import { VendorStack as VendorStackCmp, VendorState } from '../src/src-v2/components/circles';

export default {
  title: 'Components/Vendor Stack',
  component: VendorStackCmp,
  argTypes: {
    size: {
      control: {
        type: 'select',
        labels: [Size.XSMALL, Size.SMALL, Size.MEDIUM, Size.LARGE, Size.XLARGE],
      },
    },
    limit: {
      control: {
        type: 'number',
      },
    },
  },
} as Meta;

const Template = args => <VendorStackCmp {...args} />;

export const VendorStack = Template.bind({});

VendorStack.args = {
  vendors: [
    { key: 'Slack', displayName: 'Slack', iconName: 'Slack', state: VendorState.Error },
    {
      key: 'Bitbucket',
      displayName: 'Bitbucket',
      iconName: 'Bitbucket',
      state: VendorState.Warning,
    },
    { key: 'Github', displayName: 'GitHub', iconName: 'Github', state: VendorState.Attention },
    { key: 'Gitlab', displayName: 'GitLab', iconName: 'Gitlab' },
  ],
  size: Size.XLARGE,
};
