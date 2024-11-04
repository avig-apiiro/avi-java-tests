import { Meta } from '@storybook/react';
import { Size } from '@src-v2/components/types/enums/size';
import { LanguageStack as LanguageStackCmp } from '../src/src-v2/components/circles/language-stack';

export default {
  title: 'Components/Language Stack',
  component: LanguageStackCmp,
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

const Template = args => <LanguageStackCmp {...args} />;

export const LanguageStack = Template.bind({});

LanguageStack.args = {
  languages: [
    { icon: 'GoMod', name: 'GoMod' },
    { icon: 'JavaScript', name: 'JavaScript' },
    { icon: 'Python', name: 'Python' },
    { icon: 'TypeScript', name: 'TypeScript' },
  ],
  size: Size.XLARGE,
};
