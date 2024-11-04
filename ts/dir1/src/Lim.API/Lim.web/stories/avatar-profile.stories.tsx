import { Meta } from '@storybook/react';
import { AvatarProfile as AvatarProfileCmp } from '../src/src-v2/components/avatar';
import { Size } from '../src/src-v2/components/types/enums/size';

export default {
  title: 'Components/Avatar Profile',
  component: AvatarProfileCmp,
  argTypes: {
    size: {
      control: {
        type: 'select',
        labels: [Size.XSMALL, Size.SMALL, Size.MEDIUM, Size.LARGE, Size.XLARGE],
      },
    },
  },
} as Meta;

const AvatarProfileTemplate = args => <AvatarProfileCmp {...args} />;

export const AvatarProfile = AvatarProfileTemplate.bind({});
AvatarProfile.args = {
  size: Size.XLARGE,
  username: 'Gil Itzhaky',
  active: true,
  lastActivity: new Date(),
  activeSince: new Date(),
  showViewProfile: false,
};
