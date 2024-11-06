import { Meta } from '@storybook/react';
import { Avatar as AvatarCmp } from '../src/src-v2/components/avatar';
import { Size } from '../src/src-v2/components/types/enums/size';

export default {
  title: 'Components/Avatar',
  component: AvatarCmp,
  argTypes: {
    size: {
      control: {
        type: 'select',
        labels: [
          Size.XSMALL,
          Size.SMALL,
          Size.MEDIUM,
          Size.LARGE,
          Size.XLARGE,
          Size.XXLARGE,
          Size.XXXLARGE,
        ],
      },
    },
  },
} as Meta;

const AvatarTemplate = args => <AvatarCmp {...args} />;

export const Avatar = AvatarTemplate.bind({});
Avatar.args = {
  size: Size.XLARGE,
  username: 'Tomer Amir',
  active: true,
};
