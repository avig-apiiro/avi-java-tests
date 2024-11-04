import { Meta, Story } from '@storybook/react';
import _ from 'lodash';
import { DualListBox, DualListBoxProps } from '../src/src-v2/components/forms/dual-list-box';
import { SearchParams } from '../src/src-v2/services';
import { AggregationResult } from '../src/src-v2/types/aggregation-result';

export default {
  title: 'Components/DualListBox',
  component: DualListBox,
} as Meta;

type BaseItem = {
  key: string;
  name: string;
};

function generateItems(length: number) {
  return _.times(length).map<BaseItem>(i => ({ key: i.toString(), name: `${i}th item` }));
}

const sampleItems = generateItems(1000);

function searchMethod({
  limit,
  pageNumber,
  searchTerm,
}: Partial<SearchParams>): Promise<AggregationResult<BaseItem>> {
  return new Promise(resolve =>
    setTimeout(() => {
      const filteredItems = sampleItems.filter(item => item.name.includes(searchTerm));
      return resolve({
        total: sampleItems.length,
        count: filteredItems.length,
        items: _.take(filteredItems, limit * (pageNumber + 1)),
      });
    }, 2000)
  );
}

const Template: Story<DualListBoxProps<any>> = args => <DualListBox {...args} />;

export const Default = Template.bind({});
Default.args = {
  searchMethod,
  filterItemBy: (item: BaseItem, searchTerm: string) => item.name.includes(searchTerm),
  defaultValue: [],
  itemContent: ({ item }) => <>{item.name}</>,
  itemTypeDisplay: 'Items',
  onChange: (items: BaseItem[]) => console.log('Selected items:', items),
};
