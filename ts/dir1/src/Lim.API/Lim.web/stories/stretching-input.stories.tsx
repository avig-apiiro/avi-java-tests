import { Meta } from '@storybook/react';
import { StretchingInput as StretchingInputCmp } from '../src/src-v2/components/stretching-input';

export default {
  title: 'Components/StretchingInput',
  component: StretchingInputCmp,
  argTypes: {
    value: {
      type: { name: 'string' },
    },
    placeholder: { type: { name: 'string' } },
    onClose: { type: { name: 'function' } },
    onChange: { type: { name: 'function' } },
    onDelete: { type: { name: 'function' } },
  },
} as Meta;

const StretchingInputTemplate = args => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <StretchingInputCmp {...args} />
  </div>
);
export const StretchingInput = StretchingInputTemplate.bind({});
StretchingInput.args = {
  value: '',
  placeholder: '+',
  onBlur: () => console.log('on blur'),
  onChange: () => console.log('on change'),
  onDelete: () => console.log('on delete'),
};
