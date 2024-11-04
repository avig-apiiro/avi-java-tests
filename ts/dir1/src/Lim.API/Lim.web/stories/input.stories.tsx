import { Meta } from '@storybook/react';
import { useState } from 'react';
import { InputV2 as InputComp } from '@src-v2/components/forms/inputV2';
import { SearchInput } from '@src-v2/components/forms/search-input';

export default {
  title: 'Components/Input',
  argTypes: {
    placeholder: {
      control: {
        type: 'string',
      },
    },
    type: {
      control: {
        type: 'select',
      },
      labels: ['text', 'number', 'password', 'email'],
    },
    readOnly: {
      control: {
        type: 'boolean',
      },
    },
    disabled: {
      control: {
        type: 'boolean',
      },
    },
    required: {
      control: {
        type: 'boolean',
      },
    },
  },
} as Meta;

const InputTemplate = args => {
  const [value, setValue] = useState('');
  return (
    <InputComp
      {...args}
      name="input"
      value={value}
      onChange={e => setValue(e.currentTarget.value)}
      onClearClicked={() => setValue('')}
      errorMessage={args.required ? 'Invalid input field' : ''}
    />
  );
};

export const InputV2 = InputTemplate.bind({});
InputV2.args = {
  placeholder: 'I am a placeholder...',
  type: 'text',
  readOnly: false,
  disabled: false,
  required: false,
};

const SearchTemplate = args => {
  const [value, setValue] = useState('');
  return (
    <SearchInput
      {...args}
      name="search"
      value={value}
      onChange={e => setValue(e.currentTarget.value)}
      onClearClicked={() => setValue('')}
      errorMessage={args.required ? 'Invalid input field' : ''}
    />
  );
};

export const SearchV2 = SearchTemplate.bind({});
SearchV2.args = {
  placeholder: 'I am a placeholder...',
  type: 'text',
  readOnly: false,
  disabled: false,
  required: false,
};
