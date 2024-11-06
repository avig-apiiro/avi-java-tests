import _ from 'lodash';
import { ChangeEvent, JSX, ReactNode, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { Dropdown } from '@src-v2/components/dropdown';
import { useFilterOperatorsData } from '@src-v2/components/filters/filter-hooks';
import { FilterSelect } from '@src-v2/components/filters/inline-control/components/filter-select';
import { FilterSelectorsFactoryProps } from '@src-v2/components/filters/inline-control/containers/filter-controls-factory';
import { SelectMenu } from '@src-v2/components/select-menu';
import { EllipsisText } from '@src-v2/components/typography';
import { FilterOption } from '@src-v2/hooks/use-filters';

export interface FilterGeneralSelectProps extends FilterSelectorsFactoryProps {
  sortByActive?: boolean;
  searchable?: boolean;
  defaultShowCount?: number;
  fallback?: ReactNode;
  renderItem?: (option: FilterOption) => JSX.Element;
  renderLabel?: (option: FilterOption) => JSX.Element;
}

export function FilterGeneralSelect({
  filter,
  activeValues,
  sortByActive = true,
  onChange,
  onOperatorChange,
  onClear,
  onClose,
  defaultShowCount = 100,
  searchable = true,
  renderItem = option => <EllipsisText>{option.title}</EllipsisText>,
  renderLabel,
}: FilterGeneralSelectProps) {
  const operatorData = useFilterOperatorsData(filter, activeValues, onOperatorChange);
  const activeFilterValues = useMemo(
    () => activeValues[filter.key]?.values ?? [],
    [activeValues, filter.key]
  );

  const hasActiveValues = useMemo(() => Boolean(activeFilterValues?.length), [activeFilterValues]);

  const [searchedValues, setSearchedValues] = useState(filter);
  const [showMoreCount, setShowMoreCount] = useState(defaultShowCount);

  const clearFilters = () => onClear?.(filter.key);

  const handleClose = useCallback(() => {
    onClose?.();
    clearFilters();
  }, [onClose, clearFilters]);

  const handleSearch = useCallback(
    ({ target }) => {
      setSearchedValues({
        ...filter,
        options: filter.options.filter(option =>
          option.title?.toLowerCase().includes(target?.value.toLowerCase())
        ),
      });
      setShowMoreCount(defaultShowCount);
    },
    [filter, searchedValues]
  );

  const sortOptionsByActive = useCallback(
    (options: FilterOption[]) => {
      if (!sortByActive) {
        return options;
      }

      const [active, notActive] = _.partition(options, option =>
        activeFilterValues.includes(option.value)
      );
      return [...active, ...notActive];
    },
    [activeValues, filter]
  );

  const handleFilterSelectClick = useCallback(
    () =>
      setSearchedValues({
        ...searchedValues,
        options: sortOptionsByActive(filter.options),
      }),
    [sortOptionsByActive, filter]
  );

  return (
    <FilterSelect
      data-test-marker="filter"
      label={filter.title}
      defaultOpen={filter.defaultOpen}
      activeValues={useMemo(
        () =>
          activeFilterValues
            ?.map(value => filter.options.find(option => option.value === value))
            .filter(Boolean),
        [filter, activeValues]
      )}
      operatorData={operatorData}
      onClose={onClose ? handleClose : null}
      onClick={handleFilterSelectClick}
      onSearch={searchable ? handleSearch : null}
      renderItem={renderLabel ?? renderItem}>
      {searchedValues.options.slice(0, showMoreCount).map(option => (
        <Dropdown.CheckboxItem
          key={option.value}
          checked={activeFilterValues.includes(option.value)}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange?.({
              key: filter.key,
              multiple: true,
              value: option.value,
              title: option.title,
              group: option.group,
              checked: event.target.checked,
            })
          }>
          {renderItem(option)}
        </Dropdown.CheckboxItem>
      ))}
      {showMoreCount <= searchedValues.options.length && (
        <LoadMoreButton onClick={() => setShowMoreCount(showMoreCount + defaultShowCount)}>
          Load more
        </LoadMoreButton>
      )}
      {hasActiveValues && (
        <SelectMenu.Footer>
          <ClearButton onClick={clearFilters}>Clear Selection</ClearButton>
        </SelectMenu.Footer>
      )}
    </FilterSelect>
  );
}

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

const LoadMoreButton = styled(TextButton)`
  padding-left: 2rem;
`;
