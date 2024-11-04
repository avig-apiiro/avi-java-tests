import { Meta } from '@storybook/react';
import _ from 'lodash';
import { SearchCombobox as SearchComboboxCmp } from '../src/src-v2/containers/search-combobox';

export default {
  title: 'Components/Search Combobox',
  component: SearchComboboxCmp,
  argTypes: {
    as: {
      type: { name: 'string', required: true },
      options: ['Combobox', 'Select', 'MultiSelect'],
      control: 'select',
    },
  },
} as Meta;

const SearchComboboxTemplate = args => (
  <div>
    <SearchComboboxCmp {...args} />
  </div>
);
export const SearchCombobox = SearchComboboxTemplate.bind({});
SearchCombobox.args = {
  placeholder: 'I am a placeholder...',
  disabled: false,
  items: _.times(10, i => ({ label: `Options #${i + 1}`, value: `option-${i + 1}` })),
};
