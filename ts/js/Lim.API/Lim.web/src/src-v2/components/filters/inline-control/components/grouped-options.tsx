import _ from 'lodash';
import { JSX, useCallback, useMemo } from 'react';
import { ClampText } from '@src-v2/components/clamp-text';
import { Dropdown } from '@src-v2/components/dropdown';
import { FilterSelectorsFactoryProps } from '@src-v2/components/filters/inline-control/containers/filter-controls-factory';
import { ActiveFiltersData, FilterOption } from '@src-v2/hooks/use-filters';

interface GroupedOptionsProps {
  filterKey: string;
  activeValues: ActiveFiltersData;
  searchedGroups: string[];
  searchedOptions: FilterOption[];
  options: FilterOption[];
  uniqueGroups: string[];
  onChange: FilterSelectorsFactoryProps['onChange'];
  renderItem?: (option: FilterOption) => JSX.Element;
}

export const GroupedOptions = ({
  filterKey,
  activeValues,
  searchedGroups,
  searchedOptions,
  options,
  uniqueGroups,
  onChange,
  renderItem,
}: GroupedOptionsProps) => {
  const activeFilterValues = useMemo(
    () => activeValues[filterKey]?.values ?? [],
    [activeValues, filterKey]
  );
  const sortedOptions = useMemo(
    () =>
      _.sortBy(
        !_.isEmpty(searchedOptions) ? searchedOptions : options,
        option => !activeFilterValues.includes(option.value)
      ),
    [searchedOptions, filterKey]
    //Please avoid adding activeValues to the dependencies to prevent an unnecessary re-render on every item select
  );

  const hasActiveValues = useCallback(
    (group: string) =>
      activeFilterValues.some(value => {
        const option = options.find(option => option.value === value);
        return option?.group === group;
      }),
    [activeValues, filterKey, options]
  );

  return uniqueGroups.length ? (
    <>
      {uniqueGroups.map(groupName => {
        const optionsInGroup = sortedOptions.filter(option => option.group === groupName);

        return (
          <Dropdown.CollapsibleGroup
            key={groupName}
            open={hasActiveValues(groupName) || searchedGroups.includes(groupName)}
            title={`${groupName} (${optionsInGroup.length})`}>
            <Dropdown.Limiter moreLabel="Show Full List">
              {optionsInGroup.map(option => (
                <Dropdown.CheckboxItem
                  key={option.value}
                  checked={activeFilterValues.includes(option.value)}
                  onChange={event =>
                    onChange?.({
                      key: filterKey,
                      multiple: true,
                      value: option.value,
                      checked: event.target.checked,
                    })
                  }>
                  {renderItem?.(option) ?? <ClampText>{option.title}</ClampText>}
                </Dropdown.CheckboxItem>
              ))}
            </Dropdown.Limiter>
          </Dropdown.CollapsibleGroup>
        );
      })}
    </>
  ) : (
    <Dropdown.Item disabled>No options available</Dropdown.Item>
  );
};
