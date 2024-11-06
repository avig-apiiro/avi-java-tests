import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Skeleton } from '@src-v2/components/animations/skeleton';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ErrorBoundary } from '@src-v2/components/error-boundary';
import { useMoreFilters } from '@src-v2/components/filters/filter-hooks';
import { useTrackFilterAnalytics } from '@src-v2/components/filters/hooks/use-track-filter-analytics';
import { FilterSelectorsFactory } from '@src-v2/components/filters/inline-control/containers/filter-controls-factory';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useInject } from '@src-v2/hooks';
import {
  ActiveFiltersData,
  Filter,
  FilterOperation,
  UsePlainFiltersReturnValue,
} from '@src-v2/hooks/use-filters';
import { toArray } from '@src-v2/utils/collection-utils';
import { entries } from '@src-v2/utils/ts-utils';

interface PlainFiltersControlsProps {
  filters: Filter[];
  filtersData: UsePlainFiltersReturnValue;
}

function checkIfActiveValuesAreFiltersDefault(filters: Filter[], activeFilters: ActiveFiltersData) {
  const filtersWithDefaultValues = _.keyBy(
    filters.filter(filterOption => filterOption.defaultValue || filterOption.defaultValues?.length),
    'key'
  );

  return entries(activeFilters).some(([activeFilterKey, activeFilterValues]) => {
    const filterOption = filtersWithDefaultValues[activeFilterKey];
    return (
      !filterOption ||
      (!filterOption.defaultValue &&
        !_.isEqual(filterOption.defaultValues, activeFilterValues.values))
    );
  });
}

export const PlainFiltersControls = observer(
  ({
    filters,
    filtersData: { activeFilters, updateFilters, updateFilterOperator, removeFilters },
  }: PlainFiltersControlsProps) => {
    const { toaster } = useInject();
    const trackFilterAnalytics = useTrackFilterAnalytics();

    const {
      currentFilterOptions,
      currentMoreFilters,
      handleAddFilter,
      handleRemoveFilter,
      hasDefaultMoreFilters,
    } = useMoreFilters({
      filters,
      activeFilters,
    });

    const hasActiveOptions = useMemo(
      () =>
        entries(activeFilters).some(([, filter]) => Boolean(filter?.values?.length)) &&
        checkIfActiveValuesAreFiltersDefault(filters, activeFilters),
      [filters, activeFilters]
    );

    const handleFiltersChange = useCallback(
      (operations: FilterOperation | FilterOperation[]) => {
        updateFilters(operations);

        toArray(operations).forEach((operation: FilterOperation) => {
          const filterOption = filters.find(option => option.key === operation.key);
          filterOption?.title && trackFilterAnalytics(filterOption.title);
        });
      },
      [filters, activeFilters, trackFilterAnalytics]
    );

    const handleResetFilters = useCallback(() => {
      removeFilters(null);
    }, [filters, removeFilters]);

    return (
      <PlainFilterControlsContainer data-test-marker="filters">
        {currentFilterOptions.map(filter => (
          <AsyncBoundary
            key={filter.key}
            pendingFallback={<Skeleton.Select>{filter.title}</Skeleton.Select>}>
            <ErrorBoundary fallback={error => toaster.error(error)}>
              <FilterSelectorsFactory
                filter={filter}
                onClose={filter.isAdditional ? () => handleRemoveFilter(filter) : null}
                activeValues={activeFilters}
                onChange={handleFiltersChange}
                onOperatorChange={updateFilterOperator}
                onClear={removeFilters}
                data-test-marker="filter"
              />
            </ErrorBoundary>
          </AsyncBoundary>
        ))}
        {hasDefaultMoreFilters && (
          <Tooltip content="No additional filters" disabled={currentMoreFilters.length > 0}>
            <SelectMenu
              appendTo="parent"
              icon="Plus"
              variant={Variant.FILTER}
              disabled={currentMoreFilters.length === 0}
              popover={MorePopover}
              maxHeight="120rem"
              placeholder={<SelectMenu.Label>More</SelectMenu.Label>}>
              {currentMoreFilters
                .sort((a, b) => a.title.localeCompare(b.title))
                .map(filter => (
                  <HiddenFilterLabel
                    key={filter.key}
                    onClick={() => handleAddFilter(filter)}
                    data-dropdown="item">
                    {filter.title}
                  </HiddenFilterLabel>
                ))}
            </SelectMenu>
          </Tooltip>
        )}
        {hasActiveOptions && <ClearButton onClick={handleResetFilters}>Clear Filters</ClearButton>}
      </PlainFilterControlsContainer>
    );
  }
);

const MorePopover = styled(SelectMenu.Popover)`
  &:not(:has(${SelectMenu.Label})) {
    visibility: hidden;
  }
`;

export const PlainFilterControlsContainer = styled.div`
  display: flex;
  flex-flow: wrap;
  align-items: center;
  gap: 2rem;

  ${SelectMenu.Button} {
    padding: 0 3rem;

    &[data-name='Plus'] {
      width: 5rem;
      height: 5rem;
      color: var(--color-blue-gray-60);
    }
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

const HiddenFilterLabel = styled(SelectMenu.Label)`
  display: flex;
  padding: 1rem 2rem;
  font-size: var(--font-size-s);
  border-radius: 2rem;
  cursor: pointer;

  &:hover {
    background-color: var(--color-blue-gray-15);
  }
`;
