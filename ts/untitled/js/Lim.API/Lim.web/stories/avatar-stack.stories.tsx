import { Meta } from '@storybook/react';
import { AvatarStack as AvatarStackCmp } from '../src/src-v2/components/avatar';
import { Size } from '../src/src-v2/components/types/enums/size';

export default {
  title: 'Components/Avatar Stack',
  component: AvatarStackCmp,
  argTypes: {
    size: {
      control: {
        type: 'select',
        labels: [Size.XSMALL, Size.SMALL, Size.MEDIUM, Size.LARGE, Size.XLARGE],
      },
    },
  },
} as Meta;

const AvatarTemplate = args => <AvatarStackCmp {...args} />;

export const AvatarStack = AvatarTemplate.bind({});
AvatarStack.args = {
  identities: [
    { username: 'Tal Weintraub', identityKey: 'qwerrt11' },
    { username: 'Ariel Olin', identityKey: 'qwerrt12' },
    { username: 'Albert Rozentsvet', identityKey: 'qwerrt13' },
    { username: 'Or Vardi', identityKey: 'qwerrt14' },
    { username: 'Eldan Ben Haim', identityKey: 'qwerrt15' },
    { username: 'Idan Ben Dror', identityKey: 'qwerrt16' },
  ],
  size: Size.LARGE,
};
