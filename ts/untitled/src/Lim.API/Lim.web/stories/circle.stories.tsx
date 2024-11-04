import { Meta } from '@storybook/react';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import {
  Circle,
  LanguageCircle as LanguageCircleCmp,
  VendorCircle as VendorCircleCmp,
  VendorState,
} from '../src/src-v2/components/circles';
import {
  ActionCircleMode,
  ActionTakenCircle as ActionTakenCircleCmp,
} from '../src/src-v2/components/circles/action-taken-circle';

export default {
  title: 'Components/Circle',
  argTypes: {
    size: {
      options: [Size.SMALL, Size.MEDIUM, Size.LARGE],
      control: { type: 'select' },
    },
  },
} as Meta;

const Template = args => (
  <div>
    <Circle {...args} />
  </div>
);

export const IconCircle = Template.bind({});
IconCircle.args = {
  children: <SvgIcon name="Invisible" />,
  style: {
    backgroundColor: 'var(--color-blue-gray-30)',
  },
  size: Size.LARGE,
};

export const TextCircle = Template.bind({});
TextCircle.args = {
  children: '+3',
  style: {
    backgroundColor: 'var(--color-blue-gray-30)',
    border: '0.4rem solid var(--color-white)',
  },
  size: Size.LARGE,
};

const LanguageCircleExp = args => (
  <div>
    <LanguageCircleCmp {...args} />
  </div>
);
export const LanguageCircle = LanguageCircleExp.bind({});
LanguageCircle.args = {
  name: 'CSharp',
  size: Size.LARGE,
};

const VendorCircleExp = args => (
  <div>
    <VendorCircleCmp {...args} />
  </div>
);
export const VendorCircle = VendorCircleExp.bind({});
VendorCircle.args = {
  name: 'Slack',
  size: Size.LARGE,
  state: VendorState.Error,
};

const ActionTakenCircleExp = args => (
  <div>
    <ActionTakenCircleCmp {...args} />
  </div>
);
export const ActionTakenCombined = ActionTakenCircleExp.bind({});
ActionTakenCombined.args = {
  size: Size.LARGE,
  mode: ActionCircleMode.combined,
  children: <VendorIcon name="Slack" />,
};

export const ActionTakenManual = ActionTakenCircleExp.bind({});
ActionTakenManual.args = {
  size: Size.LARGE,
  mode: ActionCircleMode.manual,
  children: <VendorIcon name="Jira" />,
};

export const ActionTakenAutomated = ActionTakenCircleExp.bind({});
ActionTakenAutomated.args = {
  size: Size.LARGE,
  mode: ActionCircleMode.automated,
  children: <VendorIcon name="GoogleChat" />,
};

export const ActionTakenSvgIcon = ActionTakenCircleExp.bind({});
ActionTakenSvgIcon.args = {
  size: Size.LARGE,
  children: <SvgIcon name="Calendar" />,
};
