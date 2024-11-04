import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { useFilterOperatorsData } from '@src-v2/components/filters/filter-hooks';
import { useTrackFilterAnalytics } from '@src-v2/components/filters/hooks/use-track-filter-analytics';
import { FilterSelect } from '@src-v2/components/filters/inline-control/components/filter-select';
import { RemoteOptions } from '@src-v2/components/filters/inline-control/components/remote-options';
import {
  FilterSelectorsFactoryProps,
  RenderItemWrapper,
} from '@src-v2/components/filters/inline-control/containers/filter-controls-factory';
import { RemoteOptionsGroup } from '@src-v2/components/filters/types';
import { ConditionalProviderIcon } from '@src-v2/components/icons';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Popover } from '@src-v2/components/tooltips/popover';
import { EllipsisText } from '@src-v2/components/typography';
import { useSuspense } from '@src-v2/hooks';
import {
  ActiveFiltersData,
  Filter,
  FilterOperation,
  FilterOption,
} from '@src-v2/hooks/use-filters';

export interface RemoteGroupedFilterSelectProps extends FilterSelectorsFactoryProps {
  filterKey?: string;
  filter: Filter;
  searchMethod: (param: { searchTerm: string }) => Promise<RemoteOptionsGroup[]>;
  initSelectedOptions: (params: {
    filterGroupToKeys?: ActiveFiltersData;
  }) => Promise<FilterOption[]>;
  onHide?: () => void;
}

export const RemoteGroupedFilterSelect = observer(
  ({
    filterKey,
    filter,
    searchMethod,
    initSelectedOptions,
    activeValues,
    onOperatorChange,
    onChange,
    onClear,
    onClose,
    onHide,
  }: RemoteGroupedFilterSelectProps) => {
    const initialOptions = useSuspense(searchMethod, { searchTerm: '' });

    const operatorData = useFilterOperatorsData(filter, activeValues, onOperatorChange);
    const [optionGroups, setOptionGroups] = useState(initialOptions);

    const filterActiveValues = useMemo(
      () =>
        _.pick(
          activeValues,
          filterKey ?? initialOptions.map(optionGroup => optionGroup.key)
        ) as ActiveFiltersData,
      [activeValues]
    );

    const selectedOptions = useFilterActionOptions(
      initSelectedOptions,
      filterActiveValues,
      optionGroups
    );

    const [searchTerm, setSearchTerm] = useState();
    const trackFilterAnalytics = useTrackFilterAnalytics();

    const handleChange = (event: FilterOperation) => {
      onChange(event);
      const filterOption = optionGroups.find(option => option.key === event.key);

      filterOption?.title && trackFilterAnalytics(filterOption.title);
    };

    const clearFilters = () => onClear?.(filterKey ?? optionGroups.map(group => group.key));

    const handleClose = useCallback(() => {
      onClose?.();
      clearFilters();
    }, [onClose, clearFilters]);

    const handleSearch = useCallback(
      ({ target }) => {
        setSearchTerm(target?.value.toLowerCase());
      },
      [optionGroups]
    );

    return (
      <FilterSelect
        label={filter.title}
        popover={RemotePopover}
        defaultOpen={filter.isAdditional && selectedOptions?.length === 0}
        activeValues={selectedOptions}
        operatorData={operatorData}
        onSearch={handleSearch}
        renderItem={(option: FilterOption) => (
          <RenderItemWrapper>
            <ConditionalProviderIcon platform name={option.provider} fallback={null} />
            <EllipsisText>{option.title}</EllipsisText>
          </RenderItemWrapper>
        )}
        onClose={onClose ? handleClose : null}
        onHide={() => {
          onHide?.();
          setSearchTerm(null);
        }}>
        {filter ? (
          <AsyncBoundary>
            <RemoteOptions
              searchTerm={searchTerm}
              setOptions={setOptionGroups}
              searchMethod={searchMethod}
              activeValues={activeValues}
              onChange={handleChange}
              filterKey={filterKey}
            />
            {selectedOptions.length > 0 && (
              <SelectMenu.Footer>
                <ClearButton onClick={clearFilters}>Clear Selection</ClearButton>
              </SelectMenu.Footer>
            )}
          </AsyncBoundary>
        ) : null}
      </FilterSelect>
    );
  }
);

export const RemotePopover = styled(FilterSelect.Popover)`
  ${Popover.Content} {
    max-height: 125rem;
  }
`;
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

function useFilterActionOptions(
  initOptions: RemoteGroupedFilterSelectProps['initSelectedOptions'],
  filterActiveValues: ActiveFiltersData,
  optionGroups: RemoteOptionsGroup[]
) {
  const initialActiveValues = useRef(filterActiveValues);

  const [selectedOptions, setSelectedOptions] = useState<FilterOption[]>([]);
  const initialSelectedOptions = useSuspense(initOptions, {
    filterGroupToKeys: initialActiveValues.current,
  });

  useEffect(() => {
    const selectedValues =
      Object.values(filterActiveValues)
        .map(activeFilterData =>
          typeof activeFilterData === 'string' ? [] : activeFilterData.values
        )
        .flat() ?? [];

    setSelectedOptions(options => {
      if (!selectedValues?.length) {
        return [];
      }

      if (
        !_.difference(
          options.map(option => option.key),
          selectedValues
        )
      ) {
        return options;
      }

      const allOptionalFilterOptions = _.keyBy(
        [...options, ...initialSelectedOptions, ...optionGroups.flatMap(group => group.options)],
        'key'
      );

      return selectedValues.map(key => allOptionalFilterOptions[key]);
    });
  }, [filterActiveValues, initialSelectedOptions, optionGroups]);

  return selectedOptions;
}
