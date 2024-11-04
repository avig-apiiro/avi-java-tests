import { storiesOf } from '@storybook/react';
import _ from 'lodash';
import { DualListBox } from '../src/src-v2/components/forms/dual-list-box';
import { SearchParams } from '../src/src-v2/services';
import { AggregationResult } from '../src/src-v2/types/aggregation-result';

type Item = {
  key: string;
  name: string;
};

function generateItems(length: number) {
  return _.times(length).map<Item>(i => ({ key: i.toString(), name: `${i + 1}th item` }));
}

const sampleItems = generateItems(1000);

function searchMethod({
  limit,
  pageNumber,
  searchTerm,
}: Partial<SearchParams>): Promise<AggregationResult<Item>> {
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

storiesOf('DualListBox', module).add('default', () => (
  <DualListBox
    searchMethod={searchMethod}
    itemTypeDisplayName="Items"
    filterBy={(item, searchTerm) => item.name.includes(searchTerm)}
    renderMainItem={({ item }) => <>This is the {item.name}</>}
    onChange={selectedItems => console.log('Selected Items:', selectedItems)}
  />
));
