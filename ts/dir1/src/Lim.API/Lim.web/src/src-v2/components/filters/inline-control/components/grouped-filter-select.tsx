import _ from 'lodash';
import { observer } from 'mobx-react';
import { JSX, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { useFilterOperatorsData } from '@src-v2/components/filters/filter-hooks';
import { useTrackFilterAnalytics } from '@src-v2/components/filters/hooks/use-track-filter-analytics';
import { FilterSelect } from '@src-v2/components/filters/inline-control/components/filter-select';
import { GroupedOptions } from '@src-v2/components/filters/inline-control/components/grouped-options';
import { RemotePopover } from '@src-v2/components/filters/inline-control/components/remote-grouped-filter-select';
import { FilterSelectorsFactoryProps } from '@src-v2/components/filters/inline-control/containers/filter-controls-factory';
import { SelectMenu } from '@src-v2/components/select-menu';
import { FilterOption } from '@src-v2/hooks/use-filters';

interface GroupedFilterSelectProps extends FilterSelectorsFactoryProps {
  renderItem?: (option: FilterOption) => JSX.Element;
  renderPlaceholder?: (option: FilterOption) => JSX.Element;
}

export const GroupedFilterSelect = observer(
  ({
    filter,
    activeValues,
    onChange,
    onOperatorChange,
    onClear,
    onClose,
    renderItem,
    renderPlaceholder,
  }: GroupedFilterSelectProps) => {
    const operatorData = useFilterOperatorsData(filter, activeValues, onOperatorChange);

    const activeFilterValues = useMemo(() => {
      const filtersData = activeValues[filter.key];
      return filtersData?.values ?? [];
    }, [activeValues, filter.key]);

    const { options } = filter;
    const [searchedOptions, setSearchedOptions] = useState([]);
    const [searchedGroups, setSearchedGroups] = useState([]);
    const uniqueGroups = useMemo(() => {
      const sortedAndMappedOptions = _.sortBy(options, option => option.groupOrder).map(
        option => option.group
      );
      return _.uniq(sortedAndMappedOptions);
    }, [options]);
    const trackFilterAnalytics = useTrackFilterAnalytics();

    const handleChange = event => {
      const filterOption = options.find(option => option.value === event.value);
      filterOption?.title && trackFilterAnalytics(filterOption.title);

      onChange(event);
    };

    const clearFilters = useCallback(() => onClear?.(filter.key), [filter.key]);

    const handleClose = useCallback(() => {
      onClose?.();
      clearFilters();
    }, [onClose, clearFilters]);

    const hasActiveValues = useMemo(
      () => options.some(option => activeFilterValues.includes(option.value)),
      [activeFilterValues, options, searchedOptions]
    );

    const handleSearch = useCallback(
      ({ target }) => {
        const searchTerm = target?.value.toLowerCase();
        const filteredResults = options.filter(
          result => searchTerm && result.title?.toLowerCase().includes(searchTerm)
        );
        setSearchedOptions(filteredResults);
        setSearchedGroups(
          uniqueGroups.filter(group => filteredResults.some(result => result.group === group))
        );
      },
      [options]
    );

    const handleHide = () => {
      setSearchedOptions(options);
    };

    return (
      <FilterSelect
        label={filter.title}
        defaultOpen={filter.defaultOpen}
        popover={RemotePopover}
        activeValues={activeFilterValues
          .map(value => options.find(option => option.value === value))
          .filter(Boolean)}
        operatorData={operatorData}
        renderItem={renderPlaceholder}
        onClose={onClose ? handleClose : null}
        onSearch={handleSearch}
        onHide={handleHide}>
        <AsyncBoundary>
          <GroupedOptions
            renderItem={renderItem}
            filterKey={filter.key}
            options={options}
            searchedOptions={searchedOptions}
            searchedGroups={searchedGroups}
            activeValues={activeValues}
            uniqueGroups={uniqueGroups}
            onChange={handleChange}
          />
          {hasActiveValues && (
            <SelectMenu.Footer>
              <ClearButton onClick={clearFilters}>Clear Selection</ClearButton>
            </SelectMenu.Footer>
          )}
        </AsyncBoundary>
      </FilterSelect>
    );
  }
);

const ClearButton = styled.span`
  font-size: var(--font-size-xs);
  font-weight: 400;
  color: var(--color-blue-gray-60);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--color-blue-gray-70);
  }
`;
