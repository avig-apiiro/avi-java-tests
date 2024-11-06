import { action } from '@storybook/addon-actions';
import { Meta, Story } from '@storybook/react';
import { SelectV2 as SelectCmp } from '@src-v2/components/select/select-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { SearchParams } from '../src/src-v2/services';
import { AggregationResult } from '../src/src-v2/types/aggregation-result';

export default {
  title: 'Components/Select',
  component: SelectCmp,
  layout: 'centered',
  argTypes: {
    size: {
      control: {
        type: 'select',
        labels: [Size.MEDIUM, Size.LARGE],
      },
    },
  },
} as Meta;

export interface ColorOption {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

const colorOptions: ColorOption[] = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
  { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];

const Template: Story = args => <SelectCmp {...args} />;

export const Options = Template.bind({});
Options.args = {
  clearable: true,
  searchable: true,
  creatable: false,
  multiple: false,
  errorMessage: '',
  size: Size.MEDIUM,
  options: colorOptions,
  onChange: action('selected'),
};

export const Async = Template.bind({});
Async.args = {
  clearable: true,
  creatable: false,
  multiple: false,
  searchMethod: ({ searchTerm }: { searchTerm: string }) =>
    new Promise(resolve =>
      setTimeout(
        () =>
          resolve(
            colorOptions.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
          ),
        2000
      )
    ),
  size: Size.MEDIUM,
  onChange: action('selected'),
};

export const Paginated = Template.bind({});
Paginated.args = {
  clearable: true,
  creatable: false,
  multiple: false,
  searchParams: { limit: 3 },
  searchMethod: ({ searchTerm, limit, pageNumber }: Partial<SearchParams>) =>
    new Promise<AggregationResult<ColorOption>>(resolve => {
      const result = colorOptions.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

      pageNumber = pageNumber ?? 0;

      setTimeout(
        () =>
          resolve({
            items: result.slice(pageNumber * limit, (pageNumber + 1) * limit),
            count: result.length,
            total: colorOptions.length,
          }),
        2000
      );
    }),
  size: Size.MEDIUM,
  onChange: action('selected'),
};

export const CustomOption = Template.bind({});
CustomOption.args = {
  clearable: true,
  searchable: true,
  creatable: false,
  multiple: false,
  size: Size.MEDIUM,
  options: colorOptions,
  onChange: action('selected'),
  option: ({ data }) => <span style={{ color: data.color }}>{data.label}</span>,
};

export const CustomLabel = Template.bind({});
CustomLabel.args = {
  clearable: true,
  searchable: true,
  creatable: false,
  multiple: false,
  size: Size.MEDIUM,
  options: colorOptions,
  onChange: action('selected'),
  label: ({ data }) => (
    <span style={{ backgroundColor: data.color }}>
      {data.label} {data.color}
    </span>
  ),
};
