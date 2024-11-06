import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { Dropdown } from '@src-v2/components/dropdown';
import { RemoteCheckboxItem } from '@src-v2/components/filters/inline-control/components/remote-checkbox-item';
import { RemoteGroupedFilterSelectProps } from '@src-v2/components/filters/inline-control/components/remote-grouped-filter-select';
import { includesValue } from '@src-v2/components/filters/menu-control/filters-menu';
import { RemoteOptionsGroup } from '@src-v2/components/filters/types';
import { useSuspense } from '@src-v2/hooks';
import { abbreviate } from '@src-v2/utils/number-utils';

type RemoteOptionsProps = Pick<
  RemoteGroupedFilterSelectProps,
  'filterKey' | 'searchMethod' | 'activeValues'
> & {
  setOptions: (options: RemoteOptionsGroup[]) => void;
  searchTerm: string;
  onChange: (event) => void;
};

export const RemoteOptions = ({
  filterKey,
  setOptions,
  searchMethod,
  searchTerm = '',
  activeValues,
  onChange,
}: RemoteOptionsProps) => {
  const options = useSuspense(searchMethod, { searchTerm });

  useEffect(() => {
    setOptions(options);
  }, [setOptions, options]);

  const getFilterKey = optionGroup => filterKey || optionGroup.key;

  const sortedResults = useMemo(
    () =>
      options?.map(optionGroup =>
        _.sortBy(
          optionGroup.options,
          result => !includesValue(activeValues?.[getFilterKey(optionGroup)], result.key)
        )
      ),
    //Please avoid adding activeValues to the dependencies to prevent an unnecessary re-render on every item select
    [options]
  );

  const getIsOpen = useCallback(
    (optionGroup: RemoteOptionsGroup) => {
      const hasSelectedOptions =
        _.intersection(
          activeValues?.[getFilterKey(optionGroup)]?.values,
          optionGroup.options.map(opt => opt.key)
        ).length > 0;
      const hasSearchedValues = Boolean(
        searchTerm &&
          optionGroup.options.find(option =>
            option.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );

      return hasSelectedOptions || hasSearchedValues;
    },
    [activeValues, searchTerm]
  );

  return (
    <>
      {options?.length ? (
        options.length === 1 ? (
          sortedResults[0].map(option => {
            return (
              <RemoteCheckboxItem
                key={option.key}
                filterKey={getFilterKey(options[0])}
                option={option}
                activeValues={activeValues}
                onChange={onChange}
              />
            );
          })
        ) : (
          options.map((optionGroup, index) => (
            <Dropdown.CollapsibleGroup
              key={optionGroup.title}
              open={getIsOpen(optionGroup)}
              title={`${optionGroup.title} (${abbreviate(optionGroup.options.length)})`}>
              <Dropdown.Limiter moreLabel="Show Full List">
                {sortedResults[index].map(option => (
                  <RemoteCheckboxItem
                    key={option.key}
                    filterKey={getFilterKey(optionGroup)}
                    option={option}
                    activeValues={activeValues}
                    onChange={onChange}
                  />
                ))}
              </Dropdown.Limiter>
            </Dropdown.CollapsibleGroup>
          ))
        )
      ) : (
        <Dropdown.Item disabled>No options available</Dropdown.Item>
      )}
    </>
  );
};
