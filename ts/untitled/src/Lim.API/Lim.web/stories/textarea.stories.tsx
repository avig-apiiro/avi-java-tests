import { Meta } from '@storybook/react';
import { Textarea as TextareaCmp } from '../src/src-v2/components/forms/textarea';

export default {
  title: 'Components/Textarea',
  component: TextareaCmp,
  argTypes: {},
} as Meta;

const TextareaTemplate = args => (
  <div>
    <TextareaCmp {...args} />
  </div>
);

export const Textarea = TextareaTemplate.bind({});
Textarea.args = {
  placeholder: 'Type here...',
  rows: 5,
  disabled: false,
};
